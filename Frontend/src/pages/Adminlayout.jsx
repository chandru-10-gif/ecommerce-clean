import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/Admin.css";
import Header from "../components/Header";


export default function AdminLayout() {
  const navigate = useNavigate();

  return (
  <>
    <Header />

    <div className="admin-layout">
      <div className="sidebar">

        <h3>Admin Panel</h3>

        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/admin")}>Dashboard</button>
        <button onClick={() => navigate("/admin/products")}>Products</button>
        <button onClick={() => navigate("/admin/orders")}>Orders</button>
        <button onClick={() => navigate("/admin/users")}>Users</button>

      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  </>
);
}