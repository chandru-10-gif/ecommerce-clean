import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "../validations/formSchemas";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      alert(res.data.message || "Registered successfully");
      navigate("/login");
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
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "350px",
          padding: "20px",
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Register</h2>

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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
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
