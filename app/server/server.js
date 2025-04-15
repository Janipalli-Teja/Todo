const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log("Supabase client initialized");

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


// Import express if not already imported
const express = require('express');
const app = express();
app.use(express.json());

// Add a route to get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query the database for the user with the given ID
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
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

// Add this at the end of the file if not already present
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});