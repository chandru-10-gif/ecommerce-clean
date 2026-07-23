import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorStats } from "../services/VendorService";

export default function VendorDashboard() {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const navigate = useNavigate();

  const getVendorId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      const vendorId = getVendorId();
      if (!vendorId) return;

      try {
        const data = await getVendorStats(vendorId);
        setStats(data);
        setRecentProducts(data.recent_products || []);
      } catch (err) {
        console.log("Error loading stats:", err);
      }
    };

    fetchStats();
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: "#fff3cd", color: "#856404" },
      approved: { bg: "#d4edda", color: "#155724" },
      rejected: { bg: "#f8d7da", color: "#721c24" },
    };
    const c = colors[status] || { bg: "#e2e3e5", color: "#383d41" };
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: c.bg,
          color: c.color,
          textTransform: "capitalize",
        }}
      >
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="amp-wrapper">
      <h2 className="amp-title">Vendor Dashboard</h2>

      <div className="amp-stats">
        <div className="amp-stat-card amp-stat-total">
          <span className="amp-stat-icon">📦</span>
          <span className="amp-stat-number">{stats?.total ?? 0}</span>
          <span className="amp-stat-label">Total Products</span>
        </div>
        <div className="amp-stat-card amp-stat-category">
          <span className="amp-stat-icon">⏳</span>
          <span className="amp-stat-number">{stats?.pending ?? 0}</span>
          <span className="amp-stat-label">Pending</span>
        </div>
        <div className="amp-stat-card amp-stat-stock">
          <span className="amp-stat-icon">✅</span>
          <span className="amp-stat-number">{stats?.approved ?? 0}</span>
          <span className="amp-stat-label">Approved</span>
        </div>
        <div className="amp-stat-card amp-stat-low">
          <span className="amp-stat-icon">❌</span>
          <span className="amp-stat-number">{stats?.rejected ?? 0}</span>
          <span className="amp-stat-label">Rejected</span>
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Recent Products</h4>
        <button className="amp-add-btn" onClick={() => navigate("/vendor/add-product")}>
          <span className="amp-add-icon">+</span>
          Add Product
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        {recentProducts.length === 0 ? (
          <div className="amp-empty">
            <span className="amp-empty-icon">📭</span>
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="amp-product-list">
            {recentProducts.map((item, index) => (
              <div
                key={item.id || item._id}
                className="amp-list-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  alt={item.title}
                  className="amp-list-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80?text=No+Image";
                  }}
                />
                <div className="amp-list-info">
                  <h5 className="amp-list-title">{item.title}</h5>
                  <div className="amp-list-meta">
                    <span className="amp-list-category">{item.category || "N/A"}</span>
                    <span className="amp-list-price">₹{item.price}</span>
                    {getStatusBadge(item.approval_status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
