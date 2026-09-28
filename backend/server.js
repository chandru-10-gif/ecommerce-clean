require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const productRoutes = require("./routes/productRoutes");
const registerRoutes = require("./Register");
const couponRoutes = require("./routes/couponRoutes");
const stockRoutes = require("./routes/stockRoutes");
const emailRoutes = require("./routes/emailRoutes");
const vendorAuthRoutes = require("./routes/vendorAuth");
const vendorProductRoutes = require("./routes/vendorProducts");
const adminVendorProductRoutes = require("./routes/adminVendorProducts");
const otpRoutes = require("./routes/otpRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const vendorOrderRoutes = require("./routes/vendorOrderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

globalSupabase = supabaseAdmin;

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const category = req.query.category || "";
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const sort = req.query.sort || "";
  const inStock = req.query.inStock !== undefined ? req.query.inStock === "true" : null;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (category) {
    const categories = category.split(",").map(c => c.trim()).filter(Boolean);
    if (categories.length === 1) {
      query = query.ilike("category", categories[0]);
    } else if (categories.length > 1) {
      query = query.or(categories.map(c => `category.ilike.${c}`).join(","));
    }
  }

  if (minPrice !== null) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== null) {
    query = query.lte("price", maxPrice);
  }

  if (inStock === true) {
    query = query.gt("stock", 0);
  }

  if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (sort === "rating") {
    query = query.order("rating", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query
    .range(from, to);

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    products: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  });
});


// GET SINGLE PRODUCT
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json(error);
  }

  res.json(data);
});

// CREATE / UPDATE / DELETE
app.use("/api/products", productRoutes);

// REGISTER
app.use(registerRoutes);

// COUPONS
app.use("/api/coupons", couponRoutes);

// STOCK
app.use("/api/stock", stockRoutes);

// EMAIL
app.use("/api/email", emailRoutes);

// OTP
app.use("/api/otp", otpRoutes);

// NOTIFICATIONS
app.use("/api/notifications", notificationRoutes);

// VENDOR AUTH
app.use("/api/vendor", vendorAuthRoutes);

// VENDOR PRODUCTS
app.use("/api/vendor", vendorProductRoutes);

// ADMIN VENDOR PRODUCTS
app.use("/api/admin", adminVendorProductRoutes);

// ADMIN DASHBOARD
const adminDashboardRoutes = require("./routes/adminDashboard");
app.use("/api/admin", adminDashboardRoutes);

// VENDOR ORDERS
app.use("/api/vendor", vendorOrderRoutes);

// ROOT TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});


app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});
