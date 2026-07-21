require("dotenv").config();

const express = require("express");
const router = express.Router();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.post("/", async (req, res) => {
  try {
    const { title, price, category, image, description, stock } = req.body;

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          title,
          price,
          category,
          image,
          description,
          stock,
        },
      ])
      .select();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;