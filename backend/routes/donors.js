const express = require('express');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middlewares/auth');
const { calculateNbtcEligibility } = require('../utils/nbtcEligibility');
const router = express.Router();

router.get('/me', authenticate, authorize('DONOR'), async (req, res) => {
  try {
    let d = await prisma.donor.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true,
        donations: { orderBy: { date: 'desc' } },
        appointments: { include: { bloodBank: { include: { user: true } } }, orderBy: { scheduledAt: 'asc' } },
        matches: { include: { bloodRequest: { include: { hospital: { include: { user: true } } } } }, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!d) return res.status(404).json({ error: 'Donor not found' });

    // Enforce NBTC Indian donation interval rule (90 days for men, 120 days for women)
    const nbtc = calculateNbtcEligibility(d);
    if (d.eligibility !== 'PERMANENTLY_INELIGIBLE' && d.eligibility !== nbtc.status) {
      d = await prisma.donor.update({
        where: { id: d.id },
        data: { eligibility: nbtc.status },
        include: {
          user: true,
          donations: { orderBy: { date: 'desc' } },
          appointments: { include: { bloodBank: { include: { user: true } } }, orderBy: { scheduledAt: 'asc' } },
          matches: { include: { bloodRequest: { include: { hospital: { include: { user: true } } } } }, orderBy: { createdAt: 'desc' } }
        }
      });
    }

    res.json({ ...d, nbtc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', authenticate, authorize('DONOR'), async (req, res) => {
  try {
    const existing = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    const updatedGender = req.body.gender || existing?.gender || 'MALE';
    const dummyDonor = { ...existing, gender: updatedGender, eligibility: req.body.eligibility || existing?.eligibility };
    const nbtc = calculateNbtcEligibility(dummyDonor);

    const d = await prisma.donor.update({
      where: { userId: req.user.id },
      data: {
        city: req.body.city,
        address: req.body.address,
        gender: updatedGender,
        latitude: req.body.latitude === '' ? null : Number(req.body.latitude),
        longitude: req.body.longitude === '' ? null : Number(req.body.longitude),
        eligibility: dummyDonor.eligibility === 'PERMANENTLY_INELIGIBLE' ? 'PERMANENTLY_INELIGIBLE' : nbtc.status
      }
    });
    res.json({ ...d, nbtc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/donations', authenticate, authorize('DONOR'), async (req, res) => {
  try {
    const d = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    if (!d) return res.status(404).json({ error: 'Donor not found' });
    const donationDate = req.body.date ? new Date(req.body.date) : new Date();
    const donation = await prisma.donation.create({
      data: {
        donorId: d.id,
        date: donationDate,
        units: Math.max(1, Number(req.body.units) || 1),
        location: req.body.location || null
      }
    });

    // Under NBTC India rules, recording a donation initiates the 90/120 day cooldown period
    await prisma.donor.update({
      where: { id: d.id },
      data: {
        donationCount: { increment: 1 },
        lastDonation: donationDate,
        eligibility: 'TEMPORARILY_INELIGIBLE'
      }
    });
    res.status(201).json(donation);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/appointments', authenticate, authorize('DONOR'), async (req, res) => {
  try {
    const d = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    res.json(await prisma.appointment.findMany({
      where: { donorId: d.id },
      include: { bloodBank: { include: { user: true } } },
      orderBy: { scheduledAt: 'asc' }
    }));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/appointments', authenticate, authorize('DONOR'), async (req, res) => {
  try {
    const d = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    if (!d) return res.status(404).json({ error: 'Donor not found' });

    const nbtc = calculateNbtcEligibility(d);
    const appointmentDate = new Date(req.body.scheduledAt);

    // If currently within cooldown, verify appointment date is on or after nextEligibleDate
    if (nbtc.nextEligibleDate && appointmentDate < nbtc.nextEligibleDate) {
      const nextDateFormatted = new Date(nbtc.nextEligibleDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      return res.status(400).json({
        error: `NBTC India Rule: You must wait until ${nextDateFormatted} for whole blood donation (${nbtc.daysRemaining} days remaining in cooldown).`,
        nextEligibleDate: nbtc.nextEligibleDate,
        daysRemaining: nbtc.daysRemaining
      });
    }

    if (d.eligibility === 'PERMANENTLY_INELIGIBLE') {
      return res.status(400).json({ error: 'Donor is permanently ineligible for blood donation.' });
    }

    const a = await prisma.appointment.create({
      data: {
        donorId: d.id,
        bloodBankId: req.body.bloodBankId,
        scheduledAt: appointmentDate,
        notes: req.body.notes || null
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Appointment Confirmed',
        message: `Your blood donation appointment is booked for ${appointmentDate.toLocaleDateString()}.`,
        link: '/donor/appointments'
      }
    });

    res.status(201).json(a);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not book appointment' });
  }
});

router.put('/appointments/:id', authenticate, authorize('DONOR'), async (req, res) => {
  try {
    const d = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    const a = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!a || a.donorId !== d.id) return res.status(403).json({ error: 'Forbidden' });
    const data = req.body.action === 'CANCEL' ? { status: 'CANCELLED' } : { scheduledAt: new Date(req.body.scheduledAt) };
    res.json(await prisma.appointment.update({ where: { id: a.id }, data }));
  } catch (e) {
    res.status(500).json({ error: 'Could not update appointment' });
  }
});

module.exports = router;
