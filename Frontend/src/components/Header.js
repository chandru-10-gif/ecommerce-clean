import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/AuthService";
import { Icon } from "@iconify/react";
import CustomButton from "../customcomponents/button/CustomButton";
import { categories } from "../pages/CategorySection";

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