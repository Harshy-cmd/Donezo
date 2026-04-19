const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Helper: get milestones for a goal
const getMilestones = async (db, goalId) => {
  const rows = await db.all('SELECT * FROM milestones WHERE goal_id = ?', [goalId]);
  return rows.map(m => ({ id: m.id, text: m.text, done: !!m.done }));
};

// Helper: format a goal row
const formatGoal = async (db, row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  type: row.type,
  deadline: row.deadline,
  progress: row.progress,
  milestones: await getMilestones(db, row.id),
});

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    const goals = await Promise.all(rows.map(row => formatGoal(db, row)));
    res.json(goals);
  } catch (err) {
    console.error('GET /goals error:', err);
    res.status(500).json({ error: 'Failed to fetch goals.' });
  }
});

// POST /api/goals
router.post('/', async (req, res) => {
  try {
    const { title, description = '', category = 'personal', type = 'short', deadline, progress = 0, milestones = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Goal title is required.' });

    const db = await getDb();
    const goalId = req.body.id || uuidv4();

    await db.run(
      'INSERT INTO goals (id, user_id, title, description, category, type, deadline, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [goalId, req.userId, title, description, category, type, deadline, progress]
    );

    for (const m of milestones) {
      await db.run(
        'INSERT INTO milestones (id, goal_id, text, done) VALUES (?, ?, ?, ?)',
        [m.id || uuidv4(), goalId, m.text, m.done ? 1 : 0]
      );
    }

    const row = await db.get('SELECT * FROM goals WHERE id = ?', [goalId]);
    res.status(201).json(await formatGoal(db, row));
  } catch (err) {
    console.error('POST /goals error:', err);
    res.status(500).json({ error: 'Failed to create goal.' });
  }
});

// PUT /api/goals/:id  — update progress and/or other fields
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const goal = await db.get('SELECT * FROM goals WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    const { title, description, category, type, deadline, progress, milestones } = req.body;

    await db.run(
      `UPDATE goals SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        type = COALESCE(?, type),
        deadline = COALESCE(?, deadline),
        progress = COALESCE(?, progress)
       WHERE id = ? AND user_id = ?`,
      [title, description, category, type, deadline, progress, id, req.userId]
    );

    // Replace milestones if provided
    if (milestones !== undefined) {
      await db.run('DELETE FROM milestones WHERE goal_id = ?', [id]);
      for (const m of milestones) {
        await db.run(
          'INSERT INTO milestones (id, goal_id, text, done) VALUES (?, ?, ?, ?)',
          [m.id || uuidv4(), id, m.text, m.done ? 1 : 0]
        );
      }
    }

    const row = await db.get('SELECT * FROM goals WHERE id = ?', [id]);
    res.json(await formatGoal(db, row));
  } catch (err) {
    console.error('PUT /goals/:id error:', err);
    res.status(500).json({ error: 'Failed to update goal.' });
  }
});

// PATCH /api/goals/:id/milestones/:milestoneId  — toggle a milestone
router.patch('/:id/milestones/:milestoneId', async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const db = await getDb();

    const goal = await db.get('SELECT id FROM goals WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    const milestone = await db.get('SELECT * FROM milestones WHERE id = ? AND goal_id = ?', [milestoneId, id]);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });

    await db.run('UPDATE milestones SET done = ? WHERE id = ?', [milestone.done ? 0 : 1, milestoneId]);

    const row = await db.get('SELECT * FROM goals WHERE id = ?', [id]);
    res.json(await formatGoal(db, row));
  } catch (err) {
    console.error('PATCH milestone error:', err);
    res.status(500).json({ error: 'Failed to toggle milestone.' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const goal = await db.get('SELECT id FROM goals WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    await db.run('DELETE FROM goals WHERE id = ?', [id]);
    res.json({ message: 'Goal deleted successfully.' });
  } catch (err) {
    console.error('DELETE /goals/:id error:', err);
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

module.exports = router;
