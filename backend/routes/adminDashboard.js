require("dotenv").config();

const express = require("express");
const router = express.Router();

// GET DASHBOARD STATS
router.get("/dashboard", async (req, res) => {
  try {
    const { count: products, error: prodErr } = await globalSupabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (prodErr) return res.status(500).json({ error: prodErr.message });

    const { count: orders, error: ordErr } = await globalSupabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (ordErr) return res.status(500).json({ error: ordErr.message });

    const { count: users, error: usrErr } = await globalSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usrErr) return res.status(500).json({ error: usrErr.message });

    const { data: revenueData, error: revErr } = await globalSupabase
      .from("orders")
      .select("total_amount");

    if (revErr) return res.status(500).json({ error: revErr.message });

    const revenue = (revenueData || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    res.json({ products, orders, users, revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
