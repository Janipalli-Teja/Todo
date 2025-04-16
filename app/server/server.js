const { createClient } = require("@supabase/supabase-js");
const express = require('express');
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

// Route to get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Query the 'users' table for a user with matching user_id
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
