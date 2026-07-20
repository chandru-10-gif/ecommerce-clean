import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/AuthService";
import { supabase } from "../services/supabase";
import loginImage from "../image/3230.jpg";
import { loginSchema } from "../validations/formSchemas";

export default function Login() {
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
      const result = await loginUser(data.email, data.password);

      if (!result?.session || !result?.user) {
        alert("Login failed");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("user_code");

      localStorage.setItem("token", result.session.access_token);
      localStorage.setItem("user", JSON.stringify(result.user));

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, user_code")
        .eq("id", result.user.id)
        .single();

      if (error || !profile) {
        console.log("Profile Error:", error);
        alert("Profile not found");
        return;
      }

      localStorage.setItem("role", profile.role || "");
      localStorage.setItem("user_code", profile.user_code || "");

      if (profile.role === "admin") {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      alert(error.message || "Invalid email or password");
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
        className="card shadow p-4"
        style={{ width: "350px", borderRadius: "15px" }}
      >
        <img
          src={loginImage}
          alt="Login"
          className="img-fluid"
          style={{
            height: "180px",
            width: "100%",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "15px",
          }}
        />

        <h2 className="text-center mb-4">Login</h2>

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
          Welcome to E-Commerce
        </div>

        <div className="mt-2 text-center" style={{ fontSize: "14px" }}>
          Don't have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}
