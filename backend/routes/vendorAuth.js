require("dotenv").config();

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// REGISTER VENDOR
router.post("/register", async (req, res) => {
  const {
    name,
    phone,
    address,
    email,
    password,
    shop_name,
    shop_description,
  } = req.body;

  const trimmedName = name?.trim();
  const trimmedPhone = phone?.trim();
  const trimmedAddress = address?.trim();
  const trimmedEmail = email?.trim();
  const trimmedPassword = password?.trim();
  const trimmedShopName = shop_name?.trim();
  const trimmedShopDescription = shop_description?.trim();

  if (!trimmedName || !trimmedPhone || !trimmedAddress || !trimmedEmail || !trimmedPassword || !trimmedShopName) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  if (!/^[A-Za-z\s]{2,}$/.test(trimmedName)) {
    return res.status(400).json({ error: "Please enter a valid name (letters only, min 2 characters)" });
  }

  if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
    return res.status(400).json({ error: "Please enter a valid 10-digit Indian mobile number" });
  }

  if (trimmedAddress.length < 5) {
    return res.status(400).json({ error: "Please enter a valid address (min 5 characters)" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  if (trimmedPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  console.log("Vendor register attempt:", trimmedEmail);

  try {
    const { data, error } = await globalSupabase.auth.admin.createUser({
      email: trimmedEmail,
      password: trimmedPassword,
      email_confirm: true,
    });

    if (error) {
      console.log("Create vendor user error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("Vendor user created:", data.user.id);

    const userId = data.user.id;

    const { error: profileError } = await globalSupabase
      .from("profiles")
      .insert([{
        id: userId,
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        email: trimmedEmail,
        role: "vendor",
        shop_name: trimmedShopName,
        shop_description: trimmedShopDescription || "",
      }]);

    if (profileError) {
      console.log("Vendor profile insert error:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    console.log("Vendor profile created");

    return res.status(200).json({
      message: "Vendor registered successfully",
    });

  } catch (err) {
    console.log("Vendor register catch error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// LOGIN VENDOR
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({ error: "Profile not found" });
    }

    if (profile.role !== "vendor") {
      return res.status(403).json({ error: "Access denied. Vendor account required." });
    }

    res.json({
      message: "Login successful",
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: {
        role: profile.role,
        name: profile.name,
        shop_name: profile.shop_name,
      },
    });

  } catch (err) {
    console.log("VENDOR LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
