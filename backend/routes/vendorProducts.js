require("dotenv").config();

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET ALL PRODUCTS FOR VENDOR
router.get("/products", async (req, res) => {
  const { vendor_id } = req.query;

  if (!vendor_id) {
    return res.status(400).json({ error: "vendor_id is required" });
  }

  try {
    const { data, error } = await supabase
      .from("vendor_products")
      .select("*")
      .eq("vendor_id", vendor_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE VENDOR PRODUCT
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("vendor_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "Product not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD NEW PRODUCT
router.post("/products", async (req, res) => {
  const {
    vendor_id,
    title,
    price,
    category,
    image,
    description,
    stock,
    offer_price,
    is_offer,
    document_url,
  } = req.body;

  if (!vendor_id || !title || !price) {
    return res.status(400).json({ error: "vendor_id, title, and price are required" });
  }

  try {
    const { data, error } = await supabase
      .from("vendor_products")
      .insert([{
        vendor_id,
        title,
        price,
        category,
        image,
        description,
        stock,
        offer_price: offer_price || null,
        is_offer: is_offer || false,
        document_url: document_url || "",
        approval_status: "pending",
      }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT (only if pending or rejected)
router.put("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("vendor_products")
      .select("approval_status")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existing.approval_status !== "pending" && existing.approval_status !== "rejected") {
      return res.status(400).json({ error: "Only pending or rejected products can be updated" });
    }

    const {
      title,
      price,
      category,
      image,
      description,
      stock,
      offer_price,
      is_offer,
      document_url,
    } = req.body;

    const { data, error } = await supabase
      .from("vendor_products")
      .update({
        title,
        price,
        category,
        image,
        description,
        stock,
        offer_price: offer_price || null,
        is_offer: is_offer || false,
        document_url: document_url || existing.document_url || "",
        approval_status: "pending",
      })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT (only if pending or rejected)
router.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("vendor_products")
      .select("approval_status")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existing.approval_status !== "pending" && existing.approval_status !== "rejected") {
      return res.status(400).json({ error: "Only pending or rejected products can be deleted" });
    }

    const { error } = await supabase
      .from("vendor_products")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE STOCK
router.put("/products/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { stock, adjust } = req.body;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("vendor_products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existing.approval_status !== "approved") {
      return res.status(400).json({ error: "Stock can only be updated for approved products" });
    }

    let newStock;

    if (stock !== undefined) {
      newStock = stock;
    } else if (adjust !== undefined) {
      newStock = existing.stock + adjust;
    } else {
      return res.status(400).json({ error: "Provide stock or adjust field" });
    }

    if (newStock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    const { data, error } = await supabase
      .from("vendor_products")
      .update({ stock: newStock })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET VENDOR STATS
router.get("/stats", async (req, res) => {
  const { vendor_id } = req.query;

  if (!vendor_id) {
    return res.status(400).json({ error: "vendor_id is required" });
  }

  try {
    const { data: all, error } = await supabase
      .from("vendor_products")
      .select("*")
      .eq("vendor_id", vendor_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const total = all ? all.length : 0;
    const pending = all ? all.filter(p => p.approval_status === "pending").length : 0;
    const approved = all ? all.filter(p => p.approval_status === "approved").length : 0;
    const rejected = all ? all.filter(p => p.approval_status === "rejected").length : 0;
    const recent_products = all ? all.slice(0, 5) : [];

    res.json({ total, pending, approved, rejected, recent_products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
