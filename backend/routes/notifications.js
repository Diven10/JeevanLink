const express = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (e) {
    console.error('Notifications:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } });
    res.json(updated);
  } catch (e) {
    console.error('Mark notification read:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
