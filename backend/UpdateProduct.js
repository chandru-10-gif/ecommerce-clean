require("dotenv").config();

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      price,
      category,
      image,
      description,
      stock,
      offer_price,
      is_offer,
    } = req.body;

    const { data, error } = await supabase
      .from("products")
      .update({
        title,
        price,
        category,
        image,
        description,
        stock,
        offer_price: offer_price || null,
        is_offer: is_offer || false,
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;