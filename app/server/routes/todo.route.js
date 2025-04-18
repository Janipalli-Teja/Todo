// routes/todo.route.js
const express = require('express');
const router = express.Router();

// Mock DB array (replace with real DB logic later)
let todos = [];
let currentId = 1; // Auto-incrementing ID for simplicity

// GET /todos - Get all todos with selected fields
router.get('/todos', (req, res) => {
  const result = todos.map(todo => ({
    todo_name: todo.todo_name,
    todo_description: todo.todo_description,
    todo_status: todo.todo_status,
    category_id: todo.category_id
  }));
  res.json(result);
});

// POST /todos - Create a new todo
router.post('/todos', (req, res) => {
  const {
    todo_name,
    todo_description,
    todo_type,
    todo_status,
    user_id,
    category_id
  } = req.body;

  // Basic validation
  if (!todo_name || !todo_description || !todo_type || !todo_status || !user_id || !category_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newTodo = {
    todo_id: currentId++,
    todo_created_at: new Date(),
    todo_name,
    todo_description,
    todo_type, // "non-recurring", "recurring", "habit"
    todo_status, // "completed", "in progress", "pending"
    user_id,
    category_id
  };

  todos.push(newTodo);
  res.status(201).json({ message: 'Todo created', todo: newTodo });
});

// DELETE /todos/:id - Delete a todo by ID
router.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.todo_id === id);

  if (index !== -1) {
    todos.splice(index, 1);
    res.json({ message: `Todo with id ${id} deleted.` });
  } else {
    res.status(404).json({ error: 'Todo not found.' });
  }
});

module.exports = router;
