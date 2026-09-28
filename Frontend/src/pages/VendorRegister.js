import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { vendorRegisterSchema } from "../validations/formSchemas";
import OtpVerification from "./OtpVerification";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(vendorRegisterSchema),
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
        role: "vendor",
        shop_name: data.shop_name.trim(),
        shop_description: data.shop_description?.trim() || "",
      };

      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/otp/send`,
        payload
      );

      setOtpEmail(res.data.email);
      setOtpSent(true);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Failed to send OTP");
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
        <h2 style={{ textAlign: "center" }}>Seller Register</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              type="text"
              placeholder="Name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              style={{ width: "100%", padding: "10px", margin: "10px 0" }}
              {...register("name")}
            />
            {errors.name && (
              <div
                style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}
              >
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
              <div
                style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}
              >
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
              <div
                style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}
              >
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
              <div
                style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}
              >
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
              <div
                style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}
              >
                {errors.password.message}
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Shop Name"
              className={`form-control ${errors.shop_name ? "is-invalid" : ""}`}
              style={{ width: "100%", padding: "10px", margin: "10px 0" }}
              {...register("shop_name")}
            />
            {errors.shop_name && (
              <div
                style={{ color: "red", fontSize: "12px", margin: "0 0 5px 0" }}
              >
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              background: "blue",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Registering..." : "Register as Seller"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Already a seller?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/vendor-login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
