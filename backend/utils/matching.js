const prisma = require('../prismaClient');

const bloodCompatibility = {
  'A_POS': ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  'A_NEG': ['A_NEG', 'O_NEG'],
  'B_POS': ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  'B_NEG': ['B_NEG', 'O_NEG'],
  'AB_POS': ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'], // Universal recipient
  'AB_NEG': ['A_NEG', 'B_NEG', 'AB_NEG', 'O_NEG'],
  'O_POS': ['O_POS', 'O_NEG'],
  'O_NEG': ['O_NEG'] // Universal donor
};

const getCompatibleBloodGroups = (recipientGroup) => {
  return bloodCompatibility[recipientGroup] || [];
};

// Calculate Haversine distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  if ([lat1,lon1,lat2,lon2].some(v => v === null || v === undefined || Number.isNaN(Number(v)))) return 9999;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const findMatches = async (requestId) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: { hospital: true }
  });

  if (!request) throw new Error('Request not found');

  const compatibleGroups = getCompatibleBloodGroups(request.bloodGroup);

  // 1. Find eligible donors with compatible blood
  const potentialDonors = await prisma.donor.findMany({
    where: {
      bloodGroup: { in: compatibleGroups },
      eligibility: 'ELIGIBLE',
    },
    include: { user: true }
  });

  // Calculate distance and sort donors
  const donorsWithScore = potentialDonors.map(donor => {
    const dist = request.hospital
      ? calculateDistance(request.hospital.latitude, request.hospital.longitude, donor.latitude, donor.longitude)
      : 9999;
    return { ...donor, distance: dist };
  }).sort((a, b) => a.distance - b.distance);

  // Take top 5 closest eligible donors
  const selectedDonors = donorsWithScore.slice(0, 5);

  // Create match records
  for (const donor of selectedDonors) {
    // Check if match already exists to avoid unique constraint violation
    const existing = await prisma.match.findUnique({
      where: {
        bloodRequestId_donorId: { bloodRequestId: requestId, donorId: donor.id }
      }
    });

    if (!existing) {
      await prisma.match.create({
        data: {
          bloodRequestId: requestId,
          donorId: donor.id,
          status: 'POTENTIAL'
        }
      });

      // Send Notification to donor
      await prisma.notification.create({
        data: {
          userId: donor.userId,
          title: 'Emergency Blood Request',
          message: `URGENT: A hospital near you needs ${request.bloodGroup.replace('_', '')} blood. Can you donate?`,
          link: `/donor/dashboard`
        }
      });
    }
  }

  // Also notify verified blood banks that have compatible, unexpired stock.
  const banks = await prisma.bloodBank.findMany({
    where: { isVerified: true },
    include: { user: true, inventory: true }
  });
  for (const bank of banks) {
    const available = bank.inventory.filter(i =>
      compatibleGroups.includes(i.bloodGroup) && i.units > 0 &&
      (!i.expiryDate || new Date(i.expiryDate) >= new Date())
    ).reduce((sum, i) => sum + i.units, 0);
    if (available > 0) {
      await prisma.notification.create({
        data: {
          userId: bank.userId,
          title: 'Emergency Blood Request',
          message: `A ${request.bloodGroup.replace('_POS','+').replace('_NEG','-')} emergency request needs ${request.units} unit(s). Your bank has ${available} compatible unit(s).`,
          link: `/blood-bank/requests`
        }
      });
    }
  }

  await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status: selectedDonors.length ? 'MATCHED' : 'MATCHING' }
  });

  return selectedDonors.length;
};

module.exports = {
  getCompatibleBloodGroups,
  calculateDistance,
  findMatches
};
