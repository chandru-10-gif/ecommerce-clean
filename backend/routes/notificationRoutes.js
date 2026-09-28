require("dotenv").config();

const express = require("express");
const router = express.Router();

// POST /api/notifications/order-placed
router.post("/order-placed", async (req, res) => {
  const { orderId, items, customerName, totalAmount } = req.body;

  console.log("NOTIFICATION REQUEST:", { orderId, itemCount: items?.length, customerName, totalAmount });

  if (!orderId || !items || !items.length) {
    return res.status(400).json({ error: "orderId and items are required" });
  }

  try {
    const notifications = [];

    // Notify admin first (always)
    notifications.push({
      recipient_id: "admin",
      recipient_role: "admin",
      type: "new_order",
      title: "New Order Received",
      message: `${customerName || "A customer"} placed an order (#${orderId.substring(0, 8)}) for ${items.length} item(s) — Rs${totalAmount}`,
      order_id: orderId,
      is_read: false,
    });

    // Find vendor for each product (check both products and vendor_products tables)
    try {
      const productIds = items.map((item) => item.product_id);
      const itemTitles = items.map((item) => item.product_title);

      // First try: look up vendor_id from products table
      const { data: productsFromMain } = await globalSupabase
        .from("products")
        .select("id, vendor_id, title")
        .in("id", productIds);

      // Second try: look up from vendor_products table by title
      const { data: vendorProducts } = await globalSupabase
        .from("vendor_products")
        .select("vendor_id, title")
        .in("title", itemTitles);

      const vendorMap = new Map();
      if (productsFromMain) {
        for (const p of productsFromMain) {
          if (p.vendor_id) vendorMap.set(p.id, p.vendor_id);
        }
      }
      if (vendorProducts) {
        for (const vp of vendorProducts) {
          for (const item of items) {
            if (item.product_title === vp.title) {
              if (!vendorMap.has(item.product_id)) {
                vendorMap.set(item.product_id, vp.vendor_id);
              }
            }
          }
        }
      }

      const vendorNotified = new Set();
      for (const item of items) {
        const vId = vendorMap.get(item.product_id);
        if (vId && !vendorNotified.has(vId)) {
          vendorNotified.add(vId);
          notifications.push({
            recipient_id: vId,
            recipient_role: "vendor",
            type: "new_order",
            title: "New Order Received",
            message: `${customerName || "A customer"} ordered your product(s) (#${orderId.substring(0, 8)})`,
            order_id: orderId,
            is_read: false,
          });
        }
      }
    } catch (prodErr) {
      console.log("Vendor lookup failed:", prodErr.message);
    }

    console.log("Inserting notifications:", notifications.length);
    const { error } = await globalSupabase
      .from("notifications")
      .insert(notifications);

    if (error) {
      console.log("Notification INSERT error:", JSON.stringify(error));
      return res.status(500).json({ error: error.message });
    }

    console.log("Notifications created successfully:", notifications.length);
    res.json({ message: "Notifications created", count: notifications.length });
  } catch (err) {
    console.log("Notification error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications?user_id=xxx&role=vendor
router.get("/", async (req, res) => {
  const { user_id, role } = req.query;

  if (!user_id || !role) {
    return res.status(400).json({ error: "user_id and role are required" });
  }

  try {
    let query = globalSupabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user_id)
      .eq("recipient_role", role)
      .order("created_at", { ascending: false })
      .limit(50);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    const unreadCount = data ? data.filter((n) => !n.is_read).length : 0;

    res.json({ notifications: data || [], unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all?user_id=xxx&role=vendor
router.put("/read-all", async (req, res) => {
  const { user_id, role } = req.query;

  if (!user_id || !role) {
    return res.status(400).json({ error: "user_id and role are required" });
  }

  try {
    const { error } = await globalSupabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user_id)
      .eq("recipient_role", role)
      .eq("is_read", false);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await globalSupabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/test — verify table exists and is accessible
router.get("/test", async (req, res) => {
  try {
    const { data, error } = await globalSupabase
      .from("notifications")
      .select("id")
      .limit(1);

    if (error) {
      return res.json({ ok: false, error: error.message, hint: "Run the SQL to create notifications table" });
    }

    res.json({ ok: true, message: "notifications table exists", count: data?.length || 0 });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// POST /api/notifications/seed — create a test notification
router.post("/seed", async (req, res) => {
  try {
    const { recipient_id, recipient_role } = req.body;
    const id = recipient_id || "admin";
    const role = recipient_role || "admin";

    const { error } = await globalSupabase
      .from("notifications")
      .insert({
        recipient_id: id,
        recipient_role: role,
        type: "test",
        title: "Test Notification",
        message: "This is a test notification. If you see this, it works!",
        is_read: false,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Test notification created for " + role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
