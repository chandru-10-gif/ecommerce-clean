import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { otpSchema } from "../validations/formSchemas";
import { sendOtp, verifyOtp } from "../services/AuthService";
import { supabase } from "../services/supabase";

export default function OtpLogin() {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(otpSchema),
  });

  const handleSendOtp = async (data) => {
    setLoading(true);
    try {
      await sendOtp(data.email);
      setEmail(data.email);
      setOtpSent(true);
      alert("OTP sent to your email!");
    } catch (error) {
      alert(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data) => {
    setLoading(true);
    try {
      const result = await verifyOtp(email, data.token);

      if (!result?.session || !result?.user) {
        alert("OTP verification failed");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("name");

      localStorage.setItem("token", result.session.access_token);
      localStorage.setItem("user", JSON.stringify(result.user));

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", result.user.id)
        .single();

      if (error || !profile) {
        alert("Profile not found");
        return;
      }

      localStorage.setItem("role", profile.role || "");
      localStorage.setItem("name", profile.name || "");

      navigate("/");
    } catch (error) {
      alert(error.message || "Invalid OTP");
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
        <h2 className="text-center mb-4">Login with OTP</h2>

        {!otpSent ? (
          <form onSubmit={handleSubmit(handleSendOtp)}>
            <div className="mb-3">
              <input
                type="email"
                placeholder="Enter your email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(handleVerifyOtp)}>
            <div className="mb-3">
              <label className="form-label">OTP sent to: {email}</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className={`form-control ${errors.token ? "is-invalid" : ""}`}
                {...register("token")}
                maxLength={6}
              />
              {errors.token && (
                <div className="invalid-feedback">{errors.token.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <div className="mt-3 text-center">
          <span
            style={{ color: "blue", cursor: "pointer", fontSize: "14px" }}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}
