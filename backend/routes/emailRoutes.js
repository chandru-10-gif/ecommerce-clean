const express = require("express");
const router = express.Router();

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  const nodemailer = require("nodemailer");
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

// POST /api/email/order-confirmation
router.post("/order-confirmation", async (req, res) => {
  const { to, orderId, items, total } = req.body;

  if (!to || !orderId || !items || !total) {
    return res.status(400).json({ error: "to, orderId, items, and total are required" });
  }

  const itemList = items
    .map((item) => `  - ${item.title || item.name} x ${item.quantity} @ ₹${item.price}`)
    .join("\n");

  const html = `
    <h2>Order Confirmed!</h2>
    <p>Thank you for your order <strong>#${orderId}</strong>.</p>
    <h3>Order Details:</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
      <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      ${items.map((item) => `<tr><td>${item.title || item.name}</td><td>${item.quantity}</td><td>₹${item.price}</td></tr>`).join("")}
    </table>
    <h3>Total: ₹${total}</h3>
    <p>We will notify you once your order is shipped.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || "no-reply@ecommerce.com",
    to,
    subject: `Order #${orderId} Confirmed`,
    html,
    text: `Order #${orderId} confirmed.\n\nItems:\n${itemList}\n\nTotal: ₹${total}`,
  };

  const mailer = getTransporter();

  if (!mailer) {
    console.log("=== Email Log (no SMTP configured) ===");
    console.log("To:", to);
    console.log("Subject:", mailOptions.subject);
    console.log("Body:", mailOptions.text);
    console.log("=======================================");
    return res.json({ message: "Email logged to console (no SMTP configured)" });
  }

  try {
    await mailer.sendMail(mailOptions);
    res.json({ message: "Order confirmation email sent" });
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ error: "Failed to send email: " + err.message });
  }
});

// POST /api/email/status-update
router.post("/status-update", async (req, res) => {
  const { to, orderId, status } = req.body;

  if (!to || !orderId || !status) {
    return res.status(400).json({ error: "to, orderId, and status are required" });
  }

  const statusMessages = {
    pending: "Your order is pending confirmation.",
    confirmed: "Your order has been confirmed!",
    shipped: "Your order has been shipped!",
    delivered: "Your order has been delivered. Thank you!",
    cancelled: "Your order has been cancelled.",
  };

  const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

  const html = `
    <h2>Order Status Update</h2>
    <p>Order <strong>#${orderId}</strong></p>
    <p style="font-size:16px;font-weight:bold;">${message}</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || "no-reply@ecommerce.com",
    to,
    subject: `Order #${orderId} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html,
    text: `Order #${orderId}: ${message}`,
  };

  const mailer = getTransporter();

  if (!mailer) {
    console.log("=== Email Log (no SMTP configured) ===");
    console.log("To:", to);
    console.log("Subject:", mailOptions.subject);
    console.log("Body:", mailOptions.text);
    console.log("=======================================");
    return res.json({ message: "Email logged to console (no SMTP configured)" });
  }

  try {
    await mailer.sendMail(mailOptions);
    res.json({ message: "Status update email sent" });
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ error: "Failed to send email: " + err.message });
  }
});

module.exports = router;
