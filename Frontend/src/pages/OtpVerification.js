import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_BASE_URL;

export default function OtpVerification({ email, onBack }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/otp/verify`, {
        email,
        otp,
      });

      alert(res.data.message || "Registered successfully");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    setResending(true);
    setError("");

    try {
      await axios.post(`${API}/api/otp/resend`, { email });
      setResendTimer(60);
      alert("OTP resent to your email!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  }, [email]);

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
        <h2 style={{ textAlign: "center" }}>Verify Email</h2>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#666",
            margin: "10px 0 20px",
          }}
        >
          We sent a 6-digit code to
          <br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="form-control"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(val);
                setError("");
              }}
              style={{
                width: "100%",
                padding: "12px",
                margin: "10px 0",
                fontSize: "20px",
                textAlign: "center",
                letterSpacing: "8px",
                fontWeight: "bold",
              }}
              maxLength={6}
              autoFocus
            />
          </div>

          {error && (
            <div
              style={{
                color: "red",
                fontSize: "13px",
                margin: "0 0 10px 0",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: "100%",
              padding: "10px",
              background: otp.length === 6
                ? "linear-gradient(135deg, #667eea, #764ba2)"
                : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: otp.length === 6 ? "pointer" : "not-allowed",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            {loading ? "Verifying..." : "Verify & Register"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          {resendTimer > 0 ? (
            <span style={{ fontSize: "13px", color: "#999" }}>
              Resend OTP in {resendTimer}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none",
                border: "none",
                color: "blue",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <span
            style={{ color: "blue", cursor: "pointer", fontSize: "14px" }}
            onClick={onBack}
          >
            Back to Registration
          </span>
        </div>
      </div>
    </div>
  );
}
