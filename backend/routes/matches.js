const express = require('express');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Get donor matches
router.get('/donor', authenticate, authorize('DONOR'), async (req, res) => {
  try {
    const donor = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    const matches = await prisma.match.findMany({
      where: { donorId: donor.id },
      include: { bloodRequest: { include: { hospital: { include: { user: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept or decline match
router.put('/:id/respond', authenticate, authorize('DONOR'), async (req, res) => {
  const { status } = req.body; // 'ACCEPTED' or 'DECLINED'
  try {
    const donor = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    if (!donor) return res.status(404).json({ error: 'Donor profile not found' });
    if (!['ACCEPTED', 'DECLINED'].includes(status)) return res.status(400).json({ error: 'Invalid response status' });
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: { bloodRequest: { include: { hospital: { include: { user: true } } } } }
    });

    if (!match || match.donorId !== donor.id) return res.status(403).json({ error: 'Forbidden' });

    // Accepting a request records one completed donation event in this MVP.
    // The match status check makes this idempotent: refreshing or clicking again
    // cannot create duplicate donation records.
    if (status === 'ACCEPTED' && match.status !== 'ACCEPTED') {
      const donationLocation = match.bloodRequest.hospital?.user?.name || match.bloodRequest.city || 'Emergency request';

      await prisma.$transaction(async (tx) => {
        await tx.match.update({
          where: { id: match.id },
          data: { status: 'ACCEPTED' }
        });

        await tx.bloodRequest.update({
          where: { id: match.bloodRequestId },
          data: { status: 'ACCEPTED' }
        });

        await tx.donation.create({
          data: {
            donorId: donor.id,
            units: Math.max(1, Number(match.bloodRequest.units) || 1),
            location: donationLocation
          }
        });

        await tx.donor.update({
          where: { id: donor.id },
          data: {
            donationCount: { increment: 1 },
            lastDonation: new Date()
          }
        });
      });

      // Notify hospital after the donation transaction succeeds.
      const hospital = match.bloodRequest.hospital;
      if (hospital) await prisma.notification.create({
        data: {
          userId: hospital.userId,
          title: 'Donor Accepted Request',
          message: `${req.user.name} has accepted your emergency request for ${match.bloodRequest.bloodGroup.replace('_', '')} blood.`,
          link: `/hospital/requests`
        }
      });
    } else if (status === 'DECLINED') {
      await prisma.match.update({
        where: { id: match.id },
        data: { status: 'DECLINED' }
      });
    }

    res.json({ message: `Match ${status.toLowerCase()} successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
