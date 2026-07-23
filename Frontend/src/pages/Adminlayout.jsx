import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/Admin.css";
import Header from "../components/Header";
import { Icon } from "@iconify/react";


export default function AdminLayout() {

  const navigate = useNavigate();

  const [open,setOpen] = useState(false);


  const handleNavigate = (path)=>{

    navigate(path);

    setOpen(false);

  };


  return (
    <>

      <Header />


      <button
        className="admin-menu-btn"
        onClick={()=>setOpen(!open)}
      >
        <Icon 
          icon="mdi:menu"
          width="25"
        />
      </button>



      {open && (
        <div
          className="admin-overlay"
          onClick={()=>setOpen(false)}
        />
      )}



      <div className="admin-layout">


        <div className={`sidebar ${open ? "show":""}`}>


          <h3>
            Admin Panel
          </h3>



          <button
            onClick={()=>handleNavigate("/admin")}
          >
            Home
          </button>



          <button
            onClick={()=>handleNavigate("/admin")}
          >
            Dashboard
          </button>



          <button
            onClick={()=>handleNavigate("/admin/products")}
          >
            Products
          </button>



          <button
            onClick={()=>handleNavigate("/admin/offers")}
          >
            Offers
          </button>



          <button
            onClick={()=>handleNavigate("/admin/orders")}
          >
            Orders
          </button>



          <button
            onClick={()=>handleNavigate("/admin/vendor-products")}
          >
            Vendor Products
          </button>



          <button
            onClick={()=>handleNavigate("/admin/users")}
          >
            Users
          </button>



          <button
            onClick={()=>handleNavigate("/admin/coupons")}
          >
            Coupons
          </button>



        </div>



        <div className="admin-content">

          <Outlet />

        </div>


      </div>


    </>
  );
}