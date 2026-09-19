const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, role, name, phone, bloodGroup, address, city, latitude, longitude } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name,
        phone
      }
    });

    const lat = latitude ? parseFloat(latitude) : null;
    const lng = longitude ? parseFloat(longitude) : null;

    if (role === 'DONOR') {
      await prisma.donor.create({
        data: { userId: user.id, bloodGroup, address, city, latitude: lat, longitude: lng }
      });
    } else if (role === 'HOSPITAL') {
      await prisma.hospital.create({
        data: { userId: user.id, address, city, latitude: lat, longitude: lng }
      });
    } else if (role === 'BLOOD_BANK') {
      await prisma.bloodBank.create({
        data: { userId: user.id, address, city, latitude: lat, longitude: lng }
      });
    } else if (role === 'RECIPIENT') {
      await prisma.recipient.create({
        data: { userId: user.id, bloodGroup, address, city }
      });
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'DONOR') {
      profile = await prisma.donor.findUnique({ where: { userId: req.user.id } });
    } else if (req.user.role === 'HOSPITAL') {
      profile = await prisma.hospital.findUnique({ where: { userId: req.user.id } });
    } else if (req.user.role === 'BLOOD_BANK') {
      profile = await prisma.bloodBank.findUnique({ where: { userId: req.user.id } });
    } else if (req.user.role === 'RECIPIENT') {
      profile = await prisma.recipient.findUnique({ where: { userId: req.user.id } });
    }

    const { password, ...userWithoutPassword } = req.user;
    res.json({ ...userWithoutPassword, profile });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
