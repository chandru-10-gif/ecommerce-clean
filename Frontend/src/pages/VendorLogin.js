import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { vendorLogin } from "../services/VendorService";
import { supabase } from "../services/supabase";
import loginImage from "../image/3230.jpg";
import { loginSchema } from "../validations/formSchemas";

export default function VendorLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await vendorLogin(data.email, data.password);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("role", "vendor");
      localStorage.setItem("shopName", result.profile?.shop_name || "");
      localStorage.setItem("profileName", result.profile?.name || "");

      const { error: sessionError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (sessionError) {
        console.warn("Supabase client session not created:", sessionError.message);
      }

      navigate("/vendor");
    } catch (error) {
      alert(error.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <div
        className="card shadow p-4 login-card"
        style={{ width: "350px", borderRadius: "15px" }}
      >
        <img
          src={loginImage}
          alt="Seller Login"
          className="img-fluid"
          style={{
            height: "180px",
            width: "100%",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "15px",
          }}
        />

        <h2 className="text-center mb-4">Seller Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <input
              type="email"
              placeholder="Email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          <div className="mb-3">
            <input
              type="password"
              placeholder="Password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              {...register("password")}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div
          className="mt-3 text-center"
          style={{ fontSize: "14px", color: "gray" }}
        >
          Seller Portal - E-Commerce
        </div>

        <div className="mt-2 text-center" style={{ fontSize: "14px" }}>
          Don't have a seller account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/vendor-register")}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}
