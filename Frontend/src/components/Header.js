import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/AuthService";
import { Icon } from "@iconify/react";
import CustomButton from "../customcomponents/button/CustomButton";

export default function Header({
  search = "",
  setSearch = () => {},
}) {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logoutUser();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("user_code");

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

  
      return (
  <>
    <div
  className="py-1 px-3 bg-info"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
        <h5 className="mb-1">Online Shopping</h5>

        <div className="row justify-content-center pt-2 pb-2">
          <div className="col-sm-12 col-md-7 col-lg-6 col-xl-5 d-flex align-items-center">

            {/* HOME */}
            <CustomButton
  variant="success"
  className="me-3"
  onClick={() => navigate("/")}
>
  <Icon
    icon="material-symbols:home"
    width="20"
  />
</CustomButton>

            {/* ADMIN BUTTON */}
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
            <input
              className="form-control"
              type="search"
              placeholder="Search Here..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {/* CART - USER ONLY */}
            {role !== "admin" && (
              <button
                className="btn btn-success ms-3"
                onClick={() => navigate("/cart")}
              >
                <Icon
                  icon="mdi:cart-outline"
                  width="20"
                />
              </button>
            )}

            {/* PROFILE MENU */}
            <div
              className="ms-3"
              ref={menuRef}
              style={{ position: "relative" }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="profile"
                onClick={() =>
                  setShowMenu(!showMenu)
                }
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              />

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "55px",
                    right: "0",
                    width: "220px",
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow:
                      "0 4px 15px rgba(0,0,0,0.15)",
                    zIndex: 9999,
                    overflow: "hidden",
                  }}
                >
                  {/* PROFILE */}
                  <div
                    onClick={() =>
                      navigate("/profile")
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 18px",
                      cursor: "pointer",
                    }}
                  >
                    <Icon
                      icon="mdi:account-circle-outline"
                      width="22"
                    />
                    <span>My Profile</span>
                  </div>

                  <hr style={{ margin: 0 }} />

                  {/* USER MENU ONLY */}
                  {role !== "admin" && (
                    <>
                      <div
                        onClick={() =>
                          navigate("/wishlist")
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "14px 18px",
                          cursor: "pointer",
                        }}
                      >
                        <Icon
                          icon="mdi:heart-outline"
                          width="22"
                        />
                        <span>Wishlist</span>
                      </div>

                      <hr style={{ margin: 0 }} />

                      <div
                        onClick={() =>
                          navigate("/cart")
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "14px 18px",
                          cursor: "pointer",
                        }}
                      >
                        <Icon
                          icon="mdi:cart-outline"
                          width="22"
                        />
                        <span>Cart</span>
                      </div>

                      <hr style={{ margin: 0 }} />

                      <div
                        onClick={() =>
                          navigate("/orders")
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "14px 18px",
                          cursor: "pointer",
                        }}
                      >
                        <Icon
                          icon="mdi:package-variant-closed"
                          width="22"
                        />
                        <span>My Orders</span>
                      </div>

                      <hr style={{ margin: 0 }} />
                    </>
                  )}

                  {/* LOGOUT */}
                  <div
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 18px",
                      cursor: "pointer",
                      color: "red",
                    }}
                  >
                    <Icon
                      icon="mdi:logout"
                      width="22"
                    />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
