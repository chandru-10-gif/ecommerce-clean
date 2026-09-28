require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function migrate() {
  console.log("Adding offer columns to products table...");

  // Try to select the columns first to check if they exist
  const { data, error: checkError } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  if (checkError) {
    console.log("Error checking products table:", checkError.message);
    return;
  }

  // Try inserting a dummy row with offer fields to see if columns exist
  // If columns don't exist, we need to add them via SQL
  // Since Supabase JS client doesn't support raw SQL, we'll try another approach

  // Attempt to use RPC to create a function and run SQL
  const { error: fnError } = await supabase.rpc("exec_sql", {
    query: "SELECT 1"
  });

  if (fnError && fnError.message.includes("function")) {
    console.log("\n========================================");
    console.log("COLUMNS NEED TO BE ADDED MANUALLY");
    console.log("========================================");
    console.log("\nPlease run this SQL in your Supabase SQL Editor:");
    console.log("(Go to https://supabase.com/dashboard → SQL Editor)\n");
    console.log("ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_price NUMERIC;");
    console.log("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT false;\n");
    console.log("========================================\n");
  } else {
    console.log("Migration function exists, attempting to add columns...");

    const { error } = await supabase.rpc("exec_sql", {
      query: `
        ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_price NUMERIC;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT false;
      `
    });

    if (error) {
      console.log("Error running migration:", error.message);
    } else {
      console.log("Columns added successfully!");
    }
  }
}

migrate();
