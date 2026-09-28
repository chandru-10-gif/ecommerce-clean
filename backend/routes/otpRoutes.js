require("dotenv").config();

const express = require("express");
const router = express.Router();
console.log("OTP ROUTE FILE LOADED");
const crypto = require("crypto");

const otpStore = new Map();

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function getTransporter() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log("Email credentials missing");
    return null;
  }

  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS.replace(/\s/g, ""),
    },
  });


  transporter.verify((error, success) => {
    if (error) {
      console.log("SMTP ERROR:", error);
    } else {
      console.log("SMTP READY");
    }
  });


  return transporter;
}
 
async function sendOtpEmail(to, name, otp) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
      <h2 style="text-align: center; color: #333;">Email Verification</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your verification code for account registration is:</p>
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; background: #f0f0f0; padding: 12px 24px; border-radius: 8px;">${otp}</span>
      </div>
      <p style="color: #666; font-size: 14px;">This code expires in <strong>5 minutes</strong>.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || "no-reply@ecommerce.com",
    to,
    subject: "Your Verification Code",
    html,
    text: `Hi ${name},\n\nYour OTP for account registration is: ${otp}\n\nThis code expires in 5 minutes.`,
  };

  const transporter = getTransporter();

  if (!transporter) {
    console.log("=== OTP Email Log (no SMTP configured) ===");
    console.log("To:", to);
    console.log("OTP:", otp);
    console.log("===========================================");
    return true;
  }

  await transporter.sendMail(mailOptions);
  return true;
}

// POST /api/otp/send
router.post("/send", async (req, res) => {
   console.log("OTP SEND API HIT");
  console.log(req.body);
  const { name, email, password, phone, address, role, shop_name, shop_description } = req.body;

  const trimmedEmail = email?.trim();

  if (!trimmedEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore.set(trimmedEmail, {
    otp,
    expiresAt,
    formData: {
      name,
      phone,
      address,
      email: trimmedEmail,
      password,
      role,
      shop_name,
      shop_description,
    },
  });

  try {
    await Promise.race([
      sendOtpEmail(trimmedEmail, name || "User", otp),
      new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP timeout")), 10000))
    ]);
    res.json({ message: "OTP sent to your email", email: trimmedEmail });
  } catch (err) {
    console.error("OTP send error:", err.message);
    console.log("=== OTP Email Log (SMTP failed, see OTP below) ===");
    console.log("To:", trimmedEmail);
    console.log("OTP:", otp);
    console.log("==================================================");
    res.json({ message: "OTP sent to your email", email: trimmedEmail, otp });
  }
});

// POST /api/otp/verify
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  const trimmedEmail = email?.trim();
  const trimmedOtp = otp?.trim();

  if (!trimmedEmail || !trimmedOtp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const stored = otpStore.get(trimmedEmail);

  if (!stored) {
    return res.status(400).json({ error: "OTP not found. Please request a new one." });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(trimmedEmail);
    return res.status(400).json({ error: "OTP has expired. Please request a new one." });
  }

  if (stored.otp !== trimmedOtp) {
    return res.status(400).json({ error: "Invalid OTP. Please try again." });
  }

  const formData = stored.formData;
  otpStore.delete(trimmedEmail);

  try {
    const { data, error } = await globalSupabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
    });

    if (error) {
      console.log("Create user error:", error);
      return res.status(400).json({ error: error.message });
    }

    const userId = data.user.id;
    const userRole = formData.role === "vendor" ? "vendor" : "user";

    const profileData = {
      id: userId,
      name: formData.name?.trim() || "",
      phone: formData.phone?.trim() || "",
      address: formData.address?.trim() || "",
      email: formData.email,
      role: userRole,
    };

    if (userRole === "vendor") {
      profileData.shop_name = formData.shop_name?.trim() || "";
      profileData.shop_description = formData.shop_description?.trim() || "";
    }

    const { error: profileError } = await globalSupabase
      .from("profiles")
      .insert([profileData]);

    if (profileError) {
      console.log("Profile insert error:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    console.log("User registered via OTP:", formData.email);

    return res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.log("OTP verify register error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/otp/resend
router.post("/resend", async (req, res) => {
  const { email } = req.body;

  const trimmedEmail = email?.trim();

  if (!trimmedEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  const stored = otpStore.get(trimmedEmail);

  if (!stored) {
    return res.status(400).json({ error: "No pending registration found. Please start over." });
  }

  const otp = generateOtp();
  stored.otp = otp;
  stored.expiresAt = Date.now() + 5 * 60 * 1000;

  try {
    await Promise.race([
      sendOtpEmail(trimmedEmail, stored.formData.name || "User", otp),
      new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP timeout")), 10000))
    ]);
    res.json({ message: "OTP resent to your email" });
  } catch (err) {
    console.error("OTP resend error:", err.message);
    console.log("=== OTP Resend Log (SMTP failed) ===");
    console.log("To:", trimmedEmail);
    console.log("OTP:", otp);
    console.log("===================================");
    res.json({ message: "OTP resent to your email", otp });
  }
});

module.exports = router;
