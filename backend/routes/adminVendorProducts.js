require("dotenv").config();

const express = require("express");
const router = express.Router();

// GET ALL VENDOR PRODUCTS (admin)
router.get("/vendor-products", async (req, res) => {
  const { status } = req.query;

  try {
    let query = globalSupabase
      .from("vendor_products")
      .select("*, profiles!inner(name, shop_name)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("approval_status", status);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// APPROVE PRODUCT (admin)
router.put("/vendor-products/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { document_url } = req.body;

  try {
    const { data: existing, error: fetchError } = await globalSupabase
      .from("vendor_products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { data: updated, error: updateError } = await globalSupabase
      .from("vendor_products")
      .update({ approval_status: "approved", document_url: document_url || existing.document_url || "" })
      .eq("id", id)
      .select();

    if (updateError) return res.status(500).json({ error: updateError.message });

    const productToInsert = {
      title: existing.title,
      price: existing.price,
      category: existing.category,
      image: existing.image,
      description: existing.description || "",
      stock: existing.stock || 0,
      offer_price: existing.offer_price || null,
      is_offer: existing.is_offer || false,
      vendor_id: existing.vendor_id || null,
    };

    const { error: insertError } = await globalSupabase
      .from("products")
      .insert([productToInsert]);

    if (insertError) {
      return res.status(500).json({ error: "Failed to copy product to main catalog: " + insertError.message });
    }

    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REJECT PRODUCT (admin)
router.put("/vendor-products/:id/reject", async (req, res) => {
  const { id } = req.params;
  const { admin_notes } = req.body;

  try {
    const { data, error } = await globalSupabase
      .from("vendor_products")
      .update({
        approval_status: "rejected",
        admin_notes: admin_notes || "",
      })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET STATS
router.get("/vendor-products/stats", async (req, res) => {
  try {
    const { count: total } = await globalSupabase
      .from("vendor_products")
      .select("*", { count: "exact", head: true });

    const { count: pending } = await globalSupabase
      .from("vendor_products")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "pending");

    const { count: approved } = await globalSupabase
      .from("vendor_products")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "approved");

    const { count: rejected } = await globalSupabase
      .from("vendor_products")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "rejected");

    res.json({ total, pending, approved, rejected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
