import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { Icon } from "@iconify/react";

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, paymentMethod, itemCount } = location.state || {};

  const getPaymentLabel = (method) => {
    switch (method) {
      case "credit_card": return "Credit Card";
      case "debit_card": return "Debit Card";
      case "net_banking": return "Net Banking";
      case "cod": return "Cash on Delivery";
      case "wallet": return "Wallet";
      default: return method || "N/A";
    }
  };

  return (
    <div className="container-fluid d-flex flex-column" style={{ minHeight: "100vh" }}>
      <div className="mt-3 ms-3"><BackButton /></div>
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center" style={{ padding: "40px 20px" }}>

        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "#d4edda",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}>
          <Icon icon="mdi:check-circle" width="50" color="#28a745" />
        </div>

        <h2 className="text-success fw-bold mb-2">Order Placed Successfully!</h2>
        <p style={{ color: "#666", fontSize: "16px" }}>Thank you for shopping with us</p>

        {orderId && (
          <div className="card mt-4" style={{ maxWidth: "400px", width: "100%" }}>
            <div className="card-body p-4">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#888" }}>Order ID</span>
                <span style={{ fontWeight: "600" }}>#{orderId.substring(0, 8)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#888" }}>Items</span>
                <span style={{ fontWeight: "600" }}>{itemCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#888" }}>Payment</span>
                <span style={{ fontWeight: "600" }}>{getPaymentLabel(paymentMethod)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "spaceBetween", borderTop: "1px solid #e0e0e0", paddingTop: "12px", marginTop: "5px" }}>
                <strong>Total Paid</strong>
                <strong style={{ color: "#28a745", fontSize: "18px" }}>₹{total?.toFixed(0)}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-outline-primary" onClick={() => navigate("/orders")}>
            View My Orders
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
