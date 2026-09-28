const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// GET all coupons
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE coupon
router.post("/", async (req, res) => {
  const {
    code,
    discount_type,
    discount_value,
    max_discount,
    min_order,
    expires_at,
    is_active,
    usage_limit,
    used_count,
  } = req.body;

  if (!code || !discount_type || discount_value == null) {
    return res.status(400).json({ error: "code, discount_type, and discount_value are required" });
  }

  if (!["percent", "flat"].includes(discount_type)) {
    return res.status(400).json({ error: "discount_type must be 'percent' or 'flat'" });
  }

  try {
    const { data, error } = await supabase
      .from("coupons")
      .insert([{
        code: code.toUpperCase().trim(),
        discount_type,
        discount_value,
        max_discount: max_discount || null,
        min_order: min_order || 0,
        expires_at: expires_at || null,
        is_active: is_active !== undefined ? is_active : true,
        usage_limit: usage_limit || null,
        used_count: used_count || 0,
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE coupon
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.code) updates.code = updates.code.toUpperCase().trim();

  try {
    const { data, error } = await supabase
      .from("coupons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE coupon
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VALIDATE coupon
router.post("/validate", async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || subtotal == null) {
    return res.status(400).json({ error: "code and subtotal are required" });
  }

  try {
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code.trim())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ error: "Invalid or inactive coupon code" });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    if (coupon.min_order && subtotal < coupon.min_order) {
      return res.status(400).json({
        error: `Minimum order of ${coupon.min_order} required`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === "percent") {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
      if (discount > subtotal) discount = subtotal;
    }

    res.json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_discount: coupon.max_discount,
      },
      discount: Math.round(discount * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
