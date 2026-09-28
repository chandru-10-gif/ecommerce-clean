import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OtpVerification from "./OtpVerification";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      shop_name: "",
      shop_description: "",
    },
  });

  const onSubmit = async (data) => {
  setLoading(true);

  try {
    const payload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      email: data.email.trim(),
      password: data.password,
      role: selectedRole,
    };

    if (selectedRole === "vendor") {
      payload.shop_name = data.shop_name?.trim() || "";
      payload.shop_description = data.shop_description?.trim() || "";
    }

    // Send OTP request to backend
    await axios.post(
      `${process.env.REACT_APP_BASE_URL}/api/otp/send`,
      payload
    );

    // Save registration data for OTP verification
    sessionStorage.setItem("reg_form", JSON.stringify(payload));

    setOtpEmail(payload.email);
   console.log("Opening OTP page");
setOtpSent(true);
  } catch (err) {
    alert(
      err.response?.data?.error ||
        "Failed to send OTP. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
 if (otpSent) {
    return (
      <OtpVerification
        email={otpEmail}
        onBack={() => setOtpSent(false)}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "20px 0",
      }}
    >
      <div
        className="register-card"
        style={{
          width: "380px",
          padding: "20px",
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Register</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
            <button
              type="button"
              onClick={() => setSelectedRole("user")}
              style={{
                flex: 1,
                padding: "10px",
                border: selectedRole === "user" ? "2px solid blue" : "1px solid #ccc",
                background: selectedRole === "user" ? "#e8f0fe" : "#fff",
                color: selectedRole === "user" ? "blue" : "#333",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("vendor")}
              style={{
                flex: 1,
                padding: "10px",
                border: selectedRole === "vendor" ? "2px solid blue" : "1px solid #ccc",
                background: selectedRole === "vendor" ? "#e8f0fe" : "#fff",
                color: selectedRole === "vendor" ? "blue" : "#333",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              Seller
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="Name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              style={{ width: "100%", padding: "10px", margin: "10px 0" }}
              {...register("name")}
            />
            {errors.name && (
              <div style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}>
                {errors.name.message}
              </div>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              maxLength={10}
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              style={{ width: "100%", padding: "10px", margin: "10px 0" }}
              {...register("phone")}
            />
            {errors.phone && (
              <div style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}>
                {errors.phone.message}
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Address"
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              style={{ width: "100%", padding: "10px", margin: "10px 0" }}
              {...register("address")}
            />
            {errors.address && (
              <div style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}>
                {errors.address.message}
              </div>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              style={{ width: "100%", padding: "10px", margin: "10px 0" }}
              {...register("email")}
            />
            {errors.email && (
              <div style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}>
                {errors.email.message}
              </div>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              style={{ width: "100%", padding: "10px", margin: "10px 0" }}
              {...register("password")}
            />
            {errors.password && (
              <div style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}>
                {errors.password.message}
              </div>
            )}
          </div>

          {selectedRole === "vendor" && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Shop Name"
                  className={`form-control ${errors.shop_name ? "is-invalid" : ""}`}
                  style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                  {...register("shop_name", { required: selectedRole === "vendor" ? "Shop name is required" : false })}
                />
                {errors.shop_name && (
                  <div style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}>
                    {errors.shop_name.message}
                  </div>
                )}
              </div>

              <div>
                <textarea
                  placeholder="Shop Description (optional)"
                  className="form-control"
                  style={{ width: "100%", padding: "10px", margin: "10px 0", resize: "vertical" }}
                  rows="2"
                  {...register("shop_description")}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            {loading ? "Registering..." : selectedRole === "vendor" ? "Register as Seller" : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "10px", fontSize: "13px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
