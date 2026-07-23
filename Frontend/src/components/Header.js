import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/AuthService";
import { Icon } from "@iconify/react";
import CustomButton from "../customcomponents/button/CustomButton";
import { categories } from "../pages/CategorySection";
import axios from "axios";

const API = process.env.REACT_APP_BASE_URL;

export default function Header({
  search = "",
  setSearch = () => {},
}) {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState("");

  const role = localStorage.getItem("role");
  const cartItems = useSelector(
  (state) => state.cart.list
);

const cartCount = cartItems.reduce(
  (total, item) => total + item.count,
  0
);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const sidebarRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logoutUser();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("profileName");

    navigate("/login");
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setShowNotif(false);
      }
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".hamburger-btn")
      ) {
        setShowSidebar(false);
        setExpandedCategory(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);
  useEffect(() => {
  const name = localStorage.getItem("profileName");

  if (name) {
    setProfileName(name);
  }
}, []);

  const fetchNotifications = async () => {
    if (role !== "admin" && role !== "vendor") return;
    const userId = role === "admin" ? "admin" : (() => {
      try { return JSON.parse(localStorage.getItem("user"))?.id; } catch { return null; }
    })();
    if (!userId) return;

    try {
      const res = await axios.get(`${API}/api/notifications`, {
        params: { user_id: userId, role },
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.log("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [role]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.log("Mark read error:", err);
    }
  };

  const markAllRead = async () => {
    const userId = role === "admin" ? "admin" : (() => {
      try { return JSON.parse(localStorage.getItem("user"))?.id; } catch { return null; }
    })();
    if (!userId) return;
    try {
      await axios.put(`${API}/api/notifications/read-all?user_id=${userId}&role=${role}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.log("Mark all read error:", err);
    }
  };


  return (
  <div
    className="header-container py-2 px-3 bg-info"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
    }}
  >

    <div className="d-flex align-items-center w-100">

      {/* HAMBURGER MENU */}
      <button
        className="btn hamburger-btn me-3"
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          color: "white",
          fontSize: "24px",
          background: "none",
          border: "none",
          padding: "5px",
        }}
      >
        <Icon icon="mdi:menu" width="28" />
      </button>

      {/* LOGO */}
    <h5
  className="mb-0 me-4 text-white"
  style={{
    cursor: "pointer"
  }}
  onClick={() => navigate("/")}
>
  Online Shopping
</h5>


     


      {/* ADMIN */}
      {role === "admin" && (
        <button
          className="btn btn-dark me-3"
          onClick={() => navigate("/admin")}
        >
          <Icon
            icon="mdi:account-cog"
            width="20"
          />
        </button>
      )}

      {/* NOTIFICATION BELL */}
      {(role === "admin" || role === "vendor") && (
        <div className="me-3" ref={notifRef} style={{ position: "relative" }}>
          <button
            className="btn position-relative"
            onClick={() => setShowNotif(!showNotif)}
            style={{
              color: "white",
              background: "none",
              border: "none",
              padding: "5px",
              fontSize: "22px",
            }}
          >
            <Icon icon="mdi:bell-outline" width="24" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: "700",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #0dcaf0",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: 0,
                width: "340px",
                maxHeight: "400px",
                overflowY: "auto",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <h6 style={{ margin: 0, fontWeight: "700", fontSize: "15px" }}>
                  Notifications
                </h6>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#667eea",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "14px",
                  }}
                >
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id);
                      if (notif.order_id) {
                        setShowNotif(false);
                        navigate(role === "admin" ? "/admin/orders" : "/vendor/products");
                      }
                    }}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      background: notif.is_read ? "#fff" : "#f0f4ff",
                      transition: "background 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: notif.is_read ? "#e9ecef" : "#667eea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          icon="mdi:shopping"
                          width="18"
                          color={notif.is_read ? "#666" : "#fff"}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: notif.is_read ? "500" : "700", fontSize: "13px", color: "#333" }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "2px", lineHeight: "1.4" }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                          {new Date(notif.created_at).toLocaleString()}
                        </div>
                      </div>
                      {!notif.is_read && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#667eea",
                            flexShrink: 0,
                            marginTop: "6px",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}


      {/* SEARCH */}
      <div className="flex-grow-1">

        <input
          className="form-control"
          type="search"
          placeholder="Search Here..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>



      {/* CART */}
      {role !== "admin" && (

        <button
          className="btn btn-success ms-3 position-relative"
          onClick={() => navigate("/cart")}
        >

          <Icon
            icon="mdi:cart-outline"
            width="22"
          />


          {cartCount > 0 && (

            <span
              className="cart-count"
              style={{
                position:"absolute",
                top:"-8px",
                right:"-8px",
                background:"red",
                color:"white",
                borderRadius:"50%",
                fontSize:"12px",
                width:"20px",
                height:"20px",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}
            >
              {cartCount}
            </span>

          )}

        </button>

      )}



      {/* PROFILE */}
      <div
        className="ms-3"
        ref={menuRef}
        style={{
          position:"relative"
        }}
      >

        <div className="text-center">

  <img
    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    alt="profile"
    onClick={() => setShowMenu(!showMenu)}
    style={{
      width:"45px",
      height:"45px",
      borderRadius:"50%",
      cursor:"pointer"
    }}
  />

  <div
    style={{
      color:"white",
      fontSize:"12px",
      fontWeight:"600",
      maxWidth:"70px",
      overflow:"hidden",
      textOverflow:"ellipsis",
      whiteSpace:"nowrap"
    }}
  >
    {profileName}
  </div>

</div>


        {/* PROFILE DROPDOWN */}
        {showMenu && (

          <div
            style={{
              position:"absolute",
              top:"55px",
              right:0,
              width:"220px",
              background:"#fff",
              borderRadius:"10px",
              boxShadow:"0 4px 15px rgba(0,0,0,0.15)",
              zIndex:9999,
              overflow:"hidden"
            }}
          >


            <div
              className="profile-item"
              onClick={() => navigate("/profile")}
            >

              <Icon
                icon="mdi:account-circle-outline"
                width="22"
              />

              <span>
                My Profile
              </span>

            </div>



            <hr className="profile-divider"/>



            {role !== "admin" && (

              <>

                <div
                  className="profile-item"
                  onClick={() => navigate("/wishlist")}
                >

                  <Icon
                    icon="mdi:heart-outline"
                    width="22"
                  />

                  <span>
                    Wishlist
                  </span>

                </div>


                <hr className="profile-divider"/>



                <div
                  className="profile-item"
                  onClick={() => navigate("/cart")}
                >

                  <Icon
                    icon="mdi:cart-outline"
                    width="22"
                  />

                  <span>
                    Cart
                  </span>

                </div>


                <hr className="profile-divider"/>



                <div
                  className="profile-item"
                  onClick={() => navigate("/orders")}
                >

                  <Icon
                    icon="mdi:package-variant-closed"
                    width="22"
                  />

                  <span>
                    My Orders
                  </span>

                </div>


                <hr className="profile-divider"/>

              </>

            )}



            <div
              className="profile-item logout"
              onClick={handleLogout}
            >

              <Icon
                icon="mdi:logout"
                width="22"
              />

              <span>
                Logout
              </span>

            </div>


          </div>

        )}

      </div>


    </div>


    {/* CATEGORY SIDEBAR */}
    {showSidebar && (
      <div
        className="category-sidebar-overlay"
        onClick={() => {
          setShowSidebar(false);
          setExpandedCategory(null);
        }}
      >
        <div
          ref={sidebarRef}
          className="category-sidebar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sidebar-header">
            <h5 className="mb-0">All Categories</h5>
            <button
              className="btn btn-sm"
              onClick={() => {
                setShowSidebar(false);
                setExpandedCategory(null);
              }}
            >
              <Icon icon="mdi:close" width="24" />
            </button>
          </div>

          <div className="sidebar-categories">
            {categories.map((cat) => (
              <div key={cat.name} className="sidebar-category-item">
                <div
                  className="sidebar-category-main"
                  onClick={() => {
                    if (expandedCategory === cat.name) {
                      setExpandedCategory(null);
                    } else {
                      setExpandedCategory(cat.name);
                    }
                  }}
                >
                  <img src={cat.image} alt={cat.name} />
                  <span>{cat.name}</span>
                  <Icon
                    icon={
                      expandedCategory === cat.name
                        ? "mdi:chevron-up"
                        : "mdi:chevron-right"
                    }
                    width="20"
                    className="ms-auto"
                  />
                </div>

                {expandedCategory === cat.name && (
                  <div className="sidebar-subcategories">
                    {cat.subcategories.map((sub, idx) => (
                      <div
                        key={idx}
                        className="sidebar-subcategory-item"
                        onClick={() => {
                          navigate(`/category/${sub.value}`);
                          setShowSidebar(false);
                          setExpandedCategory(null);
                        }}
                      >
                        {sub.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

  </div>
);
}