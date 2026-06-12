require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();


app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Get all products
app.get("/api/products", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});
app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});

app.get("/test", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  res.json({ data, error });
});

app.get("/debug", (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL
  });
});