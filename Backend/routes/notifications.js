const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Helper: format a notification row
const formatNotification = (row) => ({
  id: row.id,
  text: row.text,
  time: row.time,
  read: !!row.read,
});

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows.map(formatNotification));
  } catch (err) {
    console.error('GET /notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications  — create a new notification
router.post('/', async (req, res) => {
  try {
    const { text, time = 'Just now' } = req.body;
    if (!text) return res.status(400).json({ error: 'Notification text is required.' });

    const db = await getDb();
    const notifId = uuidv4();

    await db.run(
      'INSERT INTO notifications (id, user_id, text, time, read) VALUES (?, ?, ?, ?, 0)',
      [notifId, req.userId, text, time]
    );

    const row = await db.get('SELECT * FROM notifications WHERE id = ?', [notifId]);
    res.status(201).json(formatNotification(row));
  } catch (err) {
    console.error('POST /notifications error:', err);
    res.status(500).json({ error: 'Failed to create notification.' });
  }
});

// PATCH /api/notifications/:id/read  — mark a single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const notif = await db.get('SELECT id FROM notifications WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!notif) return res.status(404).json({ error: 'Notification not found.' });

    await db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    const row = await db.get('SELECT * FROM notifications WHERE id = ?', [id]);
    res.json(formatNotification(row));
  } catch (err) {
    console.error('PATCH /notifications/:id/read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// PATCH /api/notifications/read-all  — mark ALL as read
router.patch('/read-all', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.userId]);
    const rows = await db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    res.json(rows.map(formatNotification));
  } catch (err) {
    console.error('PATCH /notifications/read-all error:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
});

// DELETE /api/notifications  — clear all notifications for the user
router.delete('/', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM notifications WHERE user_id = ?', [req.userId]);
    res.json({ message: 'All notifications cleared.' });
  } catch (err) {
    console.error('DELETE /notifications error:', err);
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

module.exports = router;
