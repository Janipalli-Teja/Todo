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
