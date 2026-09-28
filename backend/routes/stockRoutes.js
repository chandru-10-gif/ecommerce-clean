const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// POST /api/stock/deduct
router.post("/deduct", async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array is required" });
  }

  try {
    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity) {
        return res.status(400).json({ error: "Each item must have product_id and quantity" });
      }

      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", product_id)
        .single();

      if (fetchError || !product) {
        return res.status(404).json({ error: `Product ${product_id} not found` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product ${product_id}. Available: ${product.stock}, requested: ${quantity}`,
        });
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: product.stock - quantity })
        .eq("id", product_id);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }
    }

    res.json({ message: "Stock deducted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stock/restore
router.post("/restore", async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array is required" });
  }

  try {
    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity) {
        return res.status(400).json({ error: "Each item must have product_id and quantity" });
      }

      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", product_id)
        .single();

      if (fetchError || !product) {
        return res.status(404).json({ error: `Product ${product_id} not found` });
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: product.stock + quantity })
        .eq("id", product_id);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }
    }

    res.json({ message: "Stock restored successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stock/low-stock
router.get("/low-stock", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, stock, price, image")
      .lte("stock", 5)
      .order("stock", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
