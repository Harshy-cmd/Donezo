const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Helper: format a habit row
const formatHabit = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  frequency: row.frequency,
  history: JSON.parse(row.history || '[false,false,false,false,false,false,false]'),
  streak: row.streak,
  completedToday: !!row.completed_today,
});

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    res.json(rows.map(formatHabit));
  } catch (err) {
    console.error('GET /habits error:', err);
    res.status(500).json({ error: 'Failed to fetch habits.' });
  }
});

// POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { title, category = 'personal', frequency = 7, history, streak = 0 } = req.body;
    if (!title) return res.status(400).json({ error: 'Habit title is required.' });

    const db = await getDb();
    const habitId = req.body.id || uuidv4();
    const historyStr = JSON.stringify(history || [false, false, false, false, false, false, false]);

    await db.run(
      'INSERT INTO habits (id, user_id, title, category, frequency, history, streak) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [habitId, req.userId, title, category, frequency, historyStr, streak]
    );

    const row = await db.get('SELECT * FROM habits WHERE id = ?', [habitId]);
    res.status(201).json(formatHabit(row));
  } catch (err) {
    console.error('POST /habits error:', err);
    res.status(500).json({ error: 'Failed to create habit.' });
  }
});

// PATCH /api/habits/:id/toggle  — toggle completedToday and update streak
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const habit = await db.get('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const isDone = !habit.completed_today;
    const newStreak = isDone ? habit.streak + 1 : Math.max(0, habit.streak - 1);

    await db.run(
      'UPDATE habits SET completed_today = ?, streak = ? WHERE id = ?',
      [isDone ? 1 : 0, newStreak, id]
    );

    const row = await db.get('SELECT * FROM habits WHERE id = ?', [id]);
    res.json(formatHabit(row));
  } catch (err) {
    console.error('PATCH /habits/:id/toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle habit.' });
  }
});

// PATCH /api/habits/:id/history  — update a specific day in the week history
router.patch('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { index, value } = req.body;
    const db = await getDb();

    const habit = await db.get('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const history = JSON.parse(habit.history);
    history[index] = value;
    const streak = history[6] ? habit.streak + 1 : habit.streak;

    await db.run('UPDATE habits SET history = ?, streak = ? WHERE id = ?', [JSON.stringify(history), streak, id]);

    const row = await db.get('SELECT * FROM habits WHERE id = ?', [id]);
    res.json(formatHabit(row));
  } catch (err) {
    console.error('PATCH /habits/:id/history error:', err);
    res.status(500).json({ error: 'Failed to update habit history.' });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const habit = await db.get('SELECT id FROM habits WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    await db.run('DELETE FROM habits WHERE id = ?', [id]);
    res.json({ message: 'Habit deleted successfully.' });
  } catch (err) {
    console.error('DELETE /habits/:id error:', err);
    res.status(500).json({ error: 'Failed to delete habit.' });
  }
});

module.exports = router;
