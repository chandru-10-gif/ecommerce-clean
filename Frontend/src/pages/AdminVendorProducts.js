import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminVendorProducts() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchProducts();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/vendor-products/stats`);
      setStats(res.data);
    } catch (err) {
      console.log("Stats error:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/vendor-products`);
      const flattened = (res.data || []).map(item => ({
        ...item,
        vendor_name: item.profiles?.name || "Unknown",
        shop_name: item.profiles?.shop_name || "N/A",
      }));
      setProducts(flattened);
    } catch (err) {
      console.log("Fetch error:", err);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this product?")) return;
    setActionLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/admin/vendor-products/${id}/approve`);
      fetchStats();
      fetchProducts();
    } catch (err) {
      console.log("Approve error:", err);
      alert("Failed to approve product");
    }
    setActionLoading(false);
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectNotes("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/admin/vendor-products/${rejectingId}/reject`, {
        admin_notes: rejectNotes,
      });
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectNotes("");
      fetchStats();
      fetchProducts();
    } catch (err) {
      console.log("Reject error:", err);
      alert("Failed to reject product");
    }
    setActionLoading(false);
  };

  const filteredProducts = products.filter((item) => {
    const matchesFilter = filter === "all" || item.approval_status === filter;
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shop_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "amp-card-approved";
      case "rejected":
        return "amp-card-rejected";
      case "pending":
        return "amp-card-pending";
      default:
        return "amp-card-pending";
    }
  };

  return (
    <div className="amp-wrapper">
      <h2 className="amp-title">Vendor Products Review</h2>

      <div className="amp-stats">
        <div className="amp-stat-card amp-stat-total">
          <span className="amp-stat-icon">📦</span>
          <span className="amp-stat-number">{stats.total}</span>
          <span className="amp-stat-label">Total</span>
        </div>
        <div className="amp-stat-card amp-stat-pending">
          <span className="amp-stat-icon">⏳</span>
          <span className="amp-stat-number">{stats.pending}</span>
          <span className="amp-stat-label">Pending</span>
        </div>
        <div className="amp-stat-card amp-stat-approved">
          <span className="amp-stat-icon">✅</span>
          <span className="amp-stat-number">{stats.approved}</span>
          <span className="amp-stat-label">Approved</span>
        </div>
        <div className="amp-stat-card amp-stat-rejected">
          <span className="amp-stat-icon">❌</span>
          <span className="amp-stat-number">{stats.rejected}</span>
          <span className="amp-stat-label">Rejected</span>
        </div>
      </div>

      <div className="amp-toolbar">
        <div className="amp-search-wrap">
          <span className="amp-search-icon">🔍</span>
          <input
            type="text"
            className="amp-search-input"
            placeholder="Search by product title or vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="amp-toolbar-actions">
          <div className="amp-filter-tabs">
            {["all", "pending", "approved", "rejected"].map((tab) => (
              <button
                key={tab}
                className={`amp-filter-btn ${filter === tab ? "amp-filter-active" : ""}`}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="amp-empty">
          <div className="amp-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="amp-empty">
          <span className="amp-empty-icon">📭</span>
          <p>No vendor products found</p>
        </div>
      ) : (
        <div className="amp-product-grid">
          {filteredProducts.map((item, index) => (
            <div
              key={item.id || item._id}
              className="amp-product-card"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="amp-card-image-wrap">
                <img
                  src={item.image || "https://via.placeholder.com/250"}
                  alt={item.title}
                  className="amp-card-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/250?text=No+Image";
                  }}
                />
                <span className={`amp-card-status ${getStatusBadgeClass(item.approval_status)}`}>
                  {item.approval_status?.charAt(0).toUpperCase() + item.approval_status?.slice(1) || "Pending"}
                </span>
                <span className="amp-card-category">{item.category || "Uncategorized"}</span>
              </div>
              <div className="amp-card-body">
                <h4 className="amp-card-title">{item.title}</h4>
                <div className="amp-card-details">
                  <div className="amp-card-price">₹{item.price}</div>
                  <div className="amp-card-stock">
                    Stock: <strong>{item.stock ?? "N/A"}</strong>
                  </div>
                </div>
                <div className="amp-card-vendor-info">
                  <span className="amp-card-vendor">👤 {item.vendor_name || "Unknown Vendor"}</span>
                  <span className="amp-card-shop">🏪 {item.shop_name || "N/A"}</span>
                </div>
                <div className="amp-card-date">
                  Submitted: {formatDate(item.created_at)}
                </div>

                {item.approval_status === "rejected" && item.admin_notes && (
                  <div className="amp-card-reject-reason">
                    <strong>Rejection reason:</strong> {item.admin_notes}
                  </div>
                )}

                {item.approval_status === "pending" && (
                  <div className="amp-card-actions">
                    <button
                      className="amp-btn-approve"
                      onClick={() => handleApprove(item.id || item._id)}
                      disabled={actionLoading}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="amp-btn-reject"
                      onClick={() => openRejectModal(item.id || item._id)}
                      disabled={actionLoading}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="amp-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="amp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="amp-modal-header">
              <div>
                <h3 className="amp-modal-title">Reject Product</h3>
                <p className="amp-modal-subtitle">Please provide a reason for rejection</p>
              </div>
              <button
                className="amp-modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="amp-modal-body">
              <div className="mb-3">
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter the reason for rejecting this product..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
              </div>
              <div className="amp-card-actions">
                <button
                  className="amp-btn-reject"
                  onClick={handleReject}
                  disabled={actionLoading}
                  style={{ flex: 1 }}
                >
                  {actionLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
                <button
                  className="amp-btn-cancel"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
