require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// CREATE: Add a new set
app.post('/sets', (req, res) => {
  try {
    const { exercise, weight, reps, date } = req.body;
    if (!exercise || weight === undefined || reps === undefined || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const stmt = db.prepare('INSERT INTO sets (exercise, weight, reps, date) VALUES (?, ?, ?, ?)');
    const info = stmt.run(exercise, weight, reps, date);
    res.status(201).json({ id: info.lastInsertRowid, exercise, weight, reps, date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create set' });
  }
});

// READ: Get all sets
app.get('/sets', (req, res) => {
  try {
    const sets = db.prepare('SELECT * FROM sets ORDER BY id DESC').all();
    res.json(sets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sets' });
  }
});

// UPDATE: Update a set
app.put('/sets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { exercise, weight, reps, date } = req.body;
    
    // Check if exists
    const existing = db.prepare('SELECT * FROM sets WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Set not found' });
    }

    const newExercise = exercise !== undefined ? exercise : existing.exercise;
    const newWeight = weight !== undefined ? weight : existing.weight;
    const newReps = reps !== undefined ? reps : existing.reps;
    const newDate = date !== undefined ? date : existing.date;

    const stmt = db.prepare('UPDATE sets SET exercise = ?, weight = ?, reps = ?, date = ? WHERE id = ?');
    stmt.run(newExercise, newWeight, newReps, newDate, id);
    res.json({ id: parseInt(id), exercise: newExercise, weight: newWeight, reps: newReps, date: newDate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update set' });
  }
});

// DELETE: Remove a set
app.delete('/sets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM sets WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete set' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
