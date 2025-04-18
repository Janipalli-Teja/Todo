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


app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Query the 'users' table for a user with matching user_id
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
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

app.delete("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("user_id", userId)
      .select(); // Needed to return the deleted row(s)

    if (error) {
      console.error("Error deleting user:", error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User deleted successfully", deleted: data });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { name, description, category_type, user_id } = req.body;

    if (!name || !category_type || !user_id) {
      console.warn("Missing required fields");
      return res
        .status(400)
        .json({ error: "name, category_type, and user_id are required" });
    }

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name,
          description,
          category_type,
          user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error creating category:", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log("Category created:", data[0]);
    return res
      .status(201)
      .json({ message: "Category created", category: data[0] });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Categories
app.get("/api/categories", async (req, res) => {
  try {
    const { user_id, category_type } = req.query;

    let query = supabase.from("categories").select("*");
    if (user_id) query = query.eq("user_id", user_id);
    if (category_type) query = query.eq("category_type", category_type);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching categories:", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Fetched ${data.length} categories`);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get Category by ID
app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("category_id", categoryId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching category:", error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      console.warn("Category not found:", categoryId);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("Fetched category:", data);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update Category
app.put("/api/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, category_type } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (category_type) updates.category_type = category_type;

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("category_id", categoryId)
      .select();

    if (error) {
      console.error("Error updating category:", error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.warn("Category not found for update:", categoryId);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("Category updated:", data[0]);
    return res
      .status(200)
      .json({ message: "Category updated", category: data[0] });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Category
app.delete("/api/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("category_id", categoryId)
      .select();

    if (error) {
      console.error("Error deleting category:", error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.warn("Category not found for deletion:", categoryId);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("Category deleted:", data[0]);
    return res
      .status(200)
      .json({ message: "Category deleted", deleted: data[0] });
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
