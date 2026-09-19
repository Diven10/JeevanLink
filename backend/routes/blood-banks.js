const express = require('express');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Get inventory
router.get('/inventory', authenticate, authorize('BLOOD_BANK'), async (req, res) => {
  try {
    const bloodBank = await prisma.bloodBank.findUnique({ where: { userId: req.user.id } });
    const inventory = await prisma.bloodInventory.findMany({ where: { bloodBankId: bloodBank.id, OR: [{expiryDate:null},{expiryDate:{gte:new Date()}}] } });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update inventory
router.post('/inventory', authenticate, authorize('BLOOD_BANK'), async (req, res) => {
  const { bloodGroup, units, expiryDate, storageCondition } = req.body;
  try {
    const bloodBank = await prisma.bloodBank.findUnique({ where: { userId: req.user.id } });
    if (!bloodBank?.isVerified) return res.status(403).json({error:'Blood bank must be verified'});
    const inventory = await prisma.bloodInventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId: bloodBank.id,
          bloodGroup
        }
      },
      update: { units, expiryDate: expiryDate ? new Date(expiryDate) : undefined, storageCondition: storageCondition || undefined },
      create: {
        bloodBankId: bloodBank.id,
        bloodGroup,
        units,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        storageCondition: storageCondition || null
      }
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all blood banks (public/hospital)
router.get('/', async (req, res) => {
  try {
    const banks = await prisma.bloodBank.findMany({
      include: { user: true, inventory: true }
    });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
