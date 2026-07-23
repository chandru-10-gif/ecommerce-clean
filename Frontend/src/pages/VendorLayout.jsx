import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/Admin.css";
import Header from "../components/Header";
import { Icon } from "@iconify/react";

export default function VendorLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <Header />

      <button className="admin-menu-btn" onClick={() => setOpen(!open)}>
        <Icon icon="mdi:menu" width="25" />
      </button>

      {open && (
        <div className="admin-overlay" onClick={() => setOpen(false)} />
      )}

      <div className="admin-layout">
        <div className={`sidebar ${open ? "show" : ""}`}>
          <h3>Vendor Panel</h3>

          <button onClick={() => handleNavigate("/vendor")}>
            Dashboard
          </button>

          <button onClick={() => handleNavigate("/vendor/products")}>
            My Products
          </button>

          <button onClick={() => handleNavigate("/vendor/add-product")}>
            Add Product
          </button>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
