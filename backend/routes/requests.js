const express = require('express');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middlewares/auth');
const { findMatches } = require('../utils/matching');

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  if (!['HOSPITAL', 'RECIPIENT'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { bloodGroup, units, urgency = 'NORMAL', requiredDate, city, state } = req.body;
  if (!bloodGroup || !Number.isInteger(Number(units)) || Number(units) < 1) return res.status(400).json({ error: 'Blood group and a positive unit count are required.' });

  try {
    let hospitalId = null;
    let recipientId = null;
    let hospital = null;

    if (req.user.role === 'HOSPITAL') {
      hospital = await prisma.hospital.findUnique({ where: { userId: req.user.id } });
      if (!hospital) return res.status(404).json({ error: 'Hospital profile not found.' });
      hospitalId = hospital.id;
    } else {
      const recipient = await prisma.recipient.findUnique({ where: { userId: req.user.id } });
      if (!recipient) return res.status(404).json({ error: 'Recipient profile not found.' });
      recipientId = recipient.id;
    }

    const request = await prisma.bloodRequest.create({
      data: {
        hospitalId,
        recipientId,
        bloodGroup,
        units: Number(units),
        urgency,
        status: urgency === 'EMERGENCY' ? 'MATCHING' : 'PENDING',
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        city: city || hospital?.city || null,
        state: state || null,
      }
    });

    let matchCount = 0;
    if (urgency === 'EMERGENCY' && hospital) {
      matchCount = await findMatches(request.id);
    }

    res.status(201).json({
      request,
      message: urgency === 'EMERGENCY'
        ? `Emergency request created. ${matchCount} potential donor match(es) notified.`
        : 'Blood request created successfully.'
    });
  } catch (error) {
    console.error('Create blood request:', error);
    res.status(500).json({ error: 'Could not create blood request.' });
  }
});

router.get('/hospital', authenticate, authorize('HOSPITAL'), async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { userId: req.user.id } });
    if (!hospital) return res.status(404).json({ error: 'Hospital profile not found.' });
    const requests = await prisma.bloodRequest.findMany({
      where: { hospitalId: hospital.id },
      orderBy: { createdAt: 'desc' },
      include: {
        matches: { include: { donor: { include: { user: true } } } },
        recipient: { include: { user: true } }
      }
    });
    res.json(requests);
  } catch (error) {
    console.error('Hospital requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/recipient', authenticate, authorize('RECIPIENT'), async (req, res) => {
  try {
    const r = await prisma.recipient.findUnique({ where: { userId: req.user.id } });
    if (!r) return res.status(404).json({ error: 'Recipient profile not found.' });
    const requests = await prisma.bloodRequest.findMany({ where: { recipientId: r.id }, orderBy: { createdAt: 'desc' }, include: { matches: true } });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const r = await prisma.bloodRequest.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: 'Request not found' });
    let allowed = false;
    if (req.user.role === 'HOSPITAL') {
      const h = await prisma.hospital.findUnique({ where: { userId: req.user.id } });
      allowed = h?.id === r.hospitalId;
    }
    if (req.user.role === 'RECIPIENT') {
      const p = await prisma.recipient.findUnique({ where: { userId: req.user.id } });
      allowed = p?.id === r.recipientId;
    }
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    if (['FULFILLED', 'CANCELLED'].includes(r.status)) return res.status(400).json({ error: 'This request can no longer be cancelled.' });
    res.json(await prisma.bloodRequest.update({ where: { id: r.id }, data: { status: 'CANCELLED' } }));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
