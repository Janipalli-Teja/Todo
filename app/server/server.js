const { createClient } = require("@supabase/supabase-js");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log("Supabase client initialized");

// Verify Supabase connection
(async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Supabase connection failed:", error.message);
    } else {
      console.log("Supabase connection verified");
    }
  } catch (err) {
    console.error("Error verifying Supabase connection:", err);
  }
})();

// --------------------- Routes ----------------------

// GET /api/users/:userId - Get user by ID
app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user:", error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/todos - Get all todos with selected fields
app.get('/api/user/:userId/todos', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('todo') // make sure your table is actually called "todo" (not "todos")
      .select('todo_name, todo_description, todo_status, category_id')
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching user todos:', err.message);
    res.status(500).json({ error: 'Failed to fetch user todos' });
  }
});


// POST /api/user/:userId/todos - Create a new todo for a specific user
app.post('/api/user/:userId/todos', async (req, res) => {
  const { userId } = req.params;
  const {
    todo_name,
    todo_description,
    todo_type = 'non-recurring',
    todo_status = 'pending',
    category_id
  } = req.body;

  if (!todo_name || !todo_description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('todo')
      .insert([{
        todo_name,
        todo_description,
        todo_type,
        todo_status,
        user_id: userId,
        category_id,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;

    res.status(201).json({ message: 'Todo created', todo: data });
  } catch (err) {
    console.error('Error creating todo:', err.message);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});


// DELETE /api/user/:userId/todos/:todoId - Delete a specific todo for a user
app.delete('/api/user/:userId/todos/:todoId', async (req, res) => {
  const { userId, todoId } = req.params;

  try {
    const { error } = await supabase
      .from('todo')
      .delete()
      .eq('todo_id', todoId)
      .eq('user_id', userId); // ensures the todo belongs to the user

    if (error) throw error;

    res.json({ message: `Todo with id ${todoId} deleted for user ${userId}.` });
  } catch (err) {
    console.error('Error deleting todo:', err.message);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});


// ------------------- End Routes --------------------

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
