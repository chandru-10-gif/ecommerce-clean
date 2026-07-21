require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const productRoutes = require("./routes/productRoutes");
const registerRoutes = require("./Register");

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

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
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

app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});
