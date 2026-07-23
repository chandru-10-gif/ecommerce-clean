import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { vendorRegister } from "../services/VendorService";
import { vendorRegisterSchema } from "../validations/formSchemas";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
      const res = await vendorRegister({
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        email: data.email.trim(),
        password: data.password,
        shop_name: data.shop_name.trim(),
        shop_description: data.shop_description?.trim() || "",
      });

      alert(res.message || "Vendor registered successfully");
      navigate("/vendor-login");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
        <h2 style={{ textAlign: "center" }}>Vendor Register</h2>

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
            {loading ? "Registering..." : "Register as Vendor"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Already a vendor?{" "}
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
