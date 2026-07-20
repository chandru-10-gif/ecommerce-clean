import React, { useEffect, useState } from "react";
import {
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "../components/Header";

import Dashboard from "./Dashboard";
import Product from "./Product";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Success from "./Success";
import EditAddress from "../pages/EditAddress";
import Profile from "../pages/Profile";
import Wishlist from "../pages/Wishlist";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EditProfile from "../pages/EditProfile";

import Admin from "../pages/Admin";
import AdminLayout from "../pages/Adminlayout";
import AddProduct from "../pages/AddProduct";
import ManageProduct from "../pages/ManageProduct";
import EditProduct from "../pages/EditProduct";
import AdminOrders from "../pages/AdminOrders";
import MyOrders from "../pages/MyOrders";
import ResetPassword from "../pages/ResetPassword";
import OrderDetails from "../pages/OrderDetail";

import AdminUsers from "../pages/AdminUsers";

import { getProducts } from "../services/ProductService";

export default function Home() {
  const location = useLocation();

  const [token, setToken] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [singleProductLoading, setSingleProductLoading] =
    useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(8);

  useEffect(() => {
    setToken(Boolean(localStorage.getItem("token")));
  }, [location.pathname]);

  const hideHeader =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, [token, page, search, limit]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const loadProducts = async () => {
    setLoading(true);

    try {
      const response = await getProducts(page, limit, search);

      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const handlePageChange = ({ selected }) => {
    setPage(selected + 1);
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {!hideHeader && (
        <Header
          search={search}
          setSearch={setSearch}
        />
      )}

      <div
        style={{
          height: hideHeader
            ? "100vh"
            : "calc(100vh - 100px)",
          overflowY: "auto",
          marginTop: hideHeader ? 0 : "100px",
        }}
      >
        <Routes>
          {/* LOGIN */}

          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/" />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/register"
            element={
              token ? (
                <Navigate to="/" />
              ) : (
                <Register />
              )
            }
          />

          {/* USER */}

          <Route
            path="/"
            element={
              token ? (
                <Dashboard
                  products={products}
                  search={search}
                  loading={loading}
                  page={page}
                  setPage={setPage}
                  totalPages={totalPages}
                  limit={limit}
                  setLimit={setLimit}
                  handlePageChange={handlePageChange}
                  singleProductLoading={
                    singleProductLoading
                  }
                  setSingleProductLoading={
                    setSingleProductLoading
                  }
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/product/:id"
            element={<Product />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/success"
            element={<Success />}
          />

          <Route
            path="/orders"
            element={<MyOrders />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
          <Route path="/order/:id" element={<OrderDetails />} />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/edit-profile"
            element={<EditProfile />}
          />
          <Route
            path="/edit-address/:id"
            element={<EditAddress />}
          />

          {/* ADMIN */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<Admin />}
            />

            <Route
              path="users"
              element={<AdminUsers />}
            />

            

            <Route
              path="add"
              element={<AddProduct />}
            />

           <Route
  path="products"
  element={<ManageProduct />}
/>

            <Route
              path="orders"
              element={<AdminOrders />}
            />

            <Route
              path="edit/:id"
              element={<EditProduct />}
            />

 
          </Route>
                     <Route
 path="/reset-password"
 element={<ResetPassword/>}
/>
        </Routes>
      </div>
    </div>
  );
}