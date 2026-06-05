import React, { useEffect, useState } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";

import Header from "../components/Header";

import Dashboard from "./Dashboard";
import Product from "./Product";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Success from "./Success";
import Profile from "../pages/Profile";
import Wishlist from "../pages/Wishlist";
import Login from "../pages/Login";
import EditProfile from "../pages/EditProfile";

import { getProducts } from "../services/ProductService";

export default function Home() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [singleProductLoading, setSingleProductLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === "/") {
      loadProducts();
    }
  }, [location.pathname]);

  const loadProducts = async () => {
    setLoading(true);

    try {
      const data = await getProducts();

      setTimeout(() => {
        setProducts(data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER (hide only on login page OR if no token) */}
      {location.pathname !== "/login" && token && (
        <Header search={search} setSearch={setSearch} />
      )}

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />

        {/* EDIT PROFILE */}
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* DASHBOARD / HOME */}
        <Route
          path="/"
          element={
            token ? (
              <Dashboard
                products={products}
                search={search}
                loading={loading}
                singleProductLoading={singleProductLoading}
                setSingleProductLoading={setSingleProductLoading}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* PRODUCT DETAILS */}
        <Route path="/product/:id" element={<Product />} />

        {/* CART */}
        <Route path="/cart" element={<Cart />} />

        {/* CHECKOUT */}
        <Route path="/checkout" element={<Checkout />} />

        {/* SUCCESS */}
        <Route path="/success" element={<Success />} />

        {/* PROFILE */}
        <Route path="/profile" element={<Profile />} />

        {/* WISHLIST */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}