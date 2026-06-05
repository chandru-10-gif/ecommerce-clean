import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/AuthService";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";



export default function Header({
  search = "",
  setSearch = () => {},
}) {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart);

  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    window.location.reload();
  };

  // 👇 CLICK OUTSIDE CLOSE LOGIC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-3 bg-info">
      <h3>Online Shopping</h3>

      <div className="row justify-content-center pt-2 pb-2">
        <div className="col-sm-12 col-md-7 col-lg-6 col-xl-5 d-flex align-items-center">

          <button
            className="btn btn-success me-3"
            onClick={() => navigate("/")}
            
          >
            <Icon icon="material-symbols:home" width="20" />
          </button>

          <input
            className="form-control"
            type="search"
            placeholder="Search Here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="btn btn-success ms-3"
            onClick={() => navigate("/cart")}
          >
           <Icon icon="mdi:cart-outline" width="20" />
          </button>

         
          <div className="ms-3" style={{ position: "relative" }} ref={menuRef}>

            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="profile"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                cursor: "pointer"
              }}
            />

            {showMenu && (
  <div
    style={{
      position: "absolute",
      top: "50px",
      right: "0",
      width: "150px",
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
      padding: "4px",
      zIndex: 9999,
      fontSize: "13px",
    }}
  >
    <div
      style={{
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
      }}
      onClick={() => {
        navigate("/profile");
        setShowMenu(false);
      }}
    >
      <Icon icon="mdi:account-circle" width="18" />
      <span>Profile</span>
    </div>

    <hr style={{ margin: "4px 0" }} />

    <div
      style={{
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
      }}
      onClick={() => {
        navigate("/wishlist");
        setShowMenu(false);
      }}
    >
      <Icon icon="mdi:heart" width="18" color="red" />
      <span>Wishlist</span>
    </div>

    <hr style={{ margin: "4px 0" }} />

    <div
      style={{
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <Icon icon="mdi:ticket-confirmation" width="18" />
      <span>Coupons</span>
    </div>

    <hr style={{ margin: "4px 0" }} />

    <div
      style={{
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
      }}
      onClick={() => {
        navigate("/cart");
        setShowMenu(false);
      }}
    >
      <Icon icon="mdi:cart-outline" width="18" />
      <span>Cart</span>
    </div>

    <hr style={{ margin: "4px 0" }} />

    <div
      style={{
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "red",
        cursor: "pointer",
      }}
      onClick={handleLogout}
    >
      <Icon icon="mdi:logout" width="18" />
      <span>Logout</span>
    </div>
  </div>
)}




          </div>

        </div>
      </div>
    </div>
  );
}