const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Helper: fetch subtasks for a task
const getSubtasks = async (db, taskId) => {
  const rows = await db.all('SELECT * FROM subtasks WHERE task_id = ?', [taskId]);
  return rows.map(s => ({ id: s.id, title: s.title, done: !!s.done }));
};

// Helper: format a task row to the shape the frontend expects
const formatTask = async (db, row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  priority: row.priority,
  category: row.category,
  status: row.status,
  tags: JSON.parse(row.tags || '[]'),
  recurring: row.recurring,
  subtasks: await getSubtasks(db, row.id),
});

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    const tasks = await Promise.all(rows.map(row => formatTask(db, row)));
    res.json(tasks);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description = '', dueDate, priority = 'medium', category = 'personal', status = 'pending', tags = [], recurring = 'none', subtasks = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required.' });

    const db = await getDb();
    const taskId = req.body.id || uuidv4();

    await db.run(
      `INSERT INTO tasks (id, user_id, title, description, due_date, priority, category, status, tags, recurring)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskId, req.userId, title, description, dueDate, priority, category, status, JSON.stringify(tags), recurring]
    );

    for (const sub of subtasks) {
      await db.run(
        'INSERT INTO subtasks (id, task_id, title, done) VALUES (?, ?, ?, ?)',
        [sub.id || uuidv4(), taskId, sub.title, sub.done ? 1 : 0]
      );
    }

    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    res.status(201).json(await formatTask(db, row));
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const task = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const { title, description, dueDate, priority, category, status, tags, recurring, subtasks } = req.body;

    await db.run(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        due_date = COALESCE(?, due_date),
        priority = COALESCE(?, priority),
        category = COALESCE(?, category),
        status = COALESCE(?, status),
        tags = COALESCE(?, tags),
        recurring = COALESCE(?, recurring),
        updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [title, description, dueDate, priority, category, status, tags ? JSON.stringify(tags) : null, recurring, id, req.userId]
    );

    // Replace subtasks if provided
    if (subtasks !== undefined) {
      await db.run('DELETE FROM subtasks WHERE task_id = ?', [id]);
      for (const sub of subtasks) {
        await db.run(
          'INSERT INTO subtasks (id, task_id, title, done) VALUES (?, ?, ?, ?)',
          [sub.id || uuidv4(), id, sub.title, sub.done ? 1 : 0]
        );
      }
    }

    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(await formatTask(db, row));
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// PATCH /api/tasks/:id/status  — toggle status quickly
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await getDb();

    const task = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const newStatus = status !== undefined ? status : (task.status === 'done' ? 'pending' : 'done');
    await db.run("UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?", [newStatus, id]);

    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(await formatTask(db, row));
  } catch (err) {
    console.error('PATCH /tasks/:id/status error:', err);
    res.status(500).json({ error: 'Failed to toggle task status.' });
  }
});

// PATCH /api/tasks/:id/subtasks/:subtaskId  — toggle a subtask
router.patch('/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const { id, subtaskId } = req.params;
    const db = await getDb();

    const task = await db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const subtask = await db.get('SELECT * FROM subtasks WHERE id = ? AND task_id = ?', [subtaskId, id]);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found.' });

    await db.run('UPDATE subtasks SET done = ? WHERE id = ?', [subtask.done ? 0 : 1, subtaskId]);

    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(await formatTask(db, row));
  } catch (err) {
    console.error('PATCH subtask error:', err);
    res.status(500).json({ error: 'Failed to toggle subtask.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const task = await db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

module.exports = router;
