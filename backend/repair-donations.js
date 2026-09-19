const prisma = require('./prismaClient');

async function main() {
  const donors = await prisma.donor.findMany({
    include: {
      matches: {
        where: { status: 'ACCEPTED' },
        include: {
          bloodRequest: {
            include: { hospital: { include: { user: true } } }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      donations: { orderBy: { date: 'asc' } }
    }
  });

  let created = 0;

  for (const donor of donors) {
    const acceptedMatches = donor.matches.length;
    const existingDonations = donor.donations.length;
    const missing = Math.max(0, acceptedMatches - existingDonations);

    for (let i = existingDonations; i < acceptedMatches; i += 1) {
      const match = donor.matches[i];
      const location = match.bloodRequest.hospital?.user?.name || match.bloodRequest.city || 'Emergency request';
      await prisma.donation.create({
        data: {
          donorId: donor.id,
          units: Math.max(1, Number(match.bloodRequest.units) || 1),
          location
        }
      });
      created += 1;
    }

    if (missing > 0) {
      const latest = await prisma.donation.findFirst({
        where: { donorId: donor.id },
        orderBy: { date: 'desc' }
      });
      await prisma.donor.update({
        where: { id: donor.id },
        data: {
          donationCount: acceptedMatches,
          lastDonation: latest?.date || donor.lastDonation
        }
      });
    }
  }

  console.log(`Donation repair complete. Created ${created} missing donation record(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
