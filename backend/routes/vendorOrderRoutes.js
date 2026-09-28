require("dotenv").config();

const express = require("express");
const router = express.Router();

// GET ALL ORDERS (for seller to manage status)
router.get("/orders", async (req, res) => {
  try {
    const { data: ordersData, error: ordersError } = await globalSupabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) return res.status(500).json({ error: ordersError.message });

    const { data: profiles } = await globalSupabase.from("profiles").select("*");
    const { data: orderItems } = await globalSupabase.from("order_items").select("*");

    const addressIds = ordersData.map((o) => o.address_id).filter(Boolean);
    const { data: addresses } = addressIds.length > 0
      ? await globalSupabase.from("addresses").select("*").in("id", addressIds)
      : { data: [] };

    const mergedOrders = ordersData.map((order) => {
      const customer = profiles?.find((p) => p.id === order.user_id);
      const products = (orderItems || []).filter(
        (item) => String(item.order_id) === String(order.id)
      );
      const deliveryAddress = addresses?.find((a) => a.id === order.address_id) || null;
      return { ...order, customer, products, deliveryAddress };
    });

    res.json(mergedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ORDER STATUS (by vendor)
router.put("/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["Pending", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const { error } = await globalSupabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
