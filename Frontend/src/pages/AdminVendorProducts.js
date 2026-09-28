import React, { useEffect, useState } from "react";
import axios from "axios";
import { uploadDocument } from "../services/storageService";

export default function AdminVendorProducts() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [approveDocumentFile, setApproveDocumentFile] = useState(null);
  const [approving, setApproving] = useState(false);

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

  const openApproveModal = (id) => {
    setApprovingId(id);
    setApproveDocumentFile(null);
    setShowApproveModal(true);
  };

  const handleApproveWithDoc = async () => {
    setApproving(true);
    try {
      let documentUrl = "";

      if (approveDocumentFile) {
        documentUrl = await uploadDocument(approveDocumentFile);
      }

      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/admin/vendor-products/${approvingId}/approve`, { document_url: documentUrl });
      setShowApproveModal(false);
      setApprovingId(null);
      setApproveDocumentFile(null);
      fetchProducts();
      fetchStats();
      alert("Product approved successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve product");
    }
    setApproving(false);
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectNotes("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      alert("Please enter a reason for rejection");
      return;
    }
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/admin/vendor-products/${rejectingId}/reject`, { admin_notes: rejectNotes });
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectNotes("");
      fetchProducts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject product");
    }
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
      <h2 className="amp-title">Seller Products Review</h2>

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
            placeholder="Search by product title or seller name..."
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
          <p>No seller products found</p>
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
                  <span className="amp-card-vendor">👤 {item.vendor_name || "Unknown Seller"}</span>
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

                {item.document_url && (
                  <div style={{ marginTop: "8px" }}>
                    <a
                      href={item.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: "#e8f0fe",
                        color: "#1967d2",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textDecoration: "none",
                      }}
                    >
                      📄 View Document
                    </a>
                  </div>
                )}

                {item.approval_status === "pending" && (
                  <div className="amp-card-actions" style={{ marginTop: "10px" }}>
                    <button
                      className="amp-btn-approve"
                      onClick={() => openApproveModal(item.id || item._id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="amp-btn-reject"
                      onClick={() => openRejectModal(item.id || item._id)}
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

      {showApproveModal && (
        <div className="amp-modal-overlay" onClick={() => { if (!approving) setShowApproveModal(false); }}>
          <div className="amp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="amp-modal-header">
              <div>
                <h3 className="amp-modal-title">Approve Product</h3>
                <p className="amp-modal-subtitle">Upload an approval document (optional)</p>
              </div>
              <button
                className="amp-modal-close"
                onClick={() => { if (!approving) setShowApproveModal(false); }}
                disabled={approving}
              >
                ✕
              </button>
            </div>
            <div className="amp-modal-body">
              <div className="mb-3">
                <label className="form-label">Approval Document (PDF, Image)</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setApproveDocumentFile(e.target.files[0])}
                  disabled={approving}
                />
                <small style={{ color: "#888", fontSize: "12px" }}>
                  Upload a document before approving if required
                </small>
              </div>
              <div className="amp-card-actions">
                <button
                  className="amp-btn-approve"
                  onClick={handleApproveWithDoc}
                  disabled={approving}
                  style={{ flex: 1 }}
                >
                  {approving ? "Approving..." : "✓ Confirm & Approve"}
                </button>
                <button
                  className="amp-btn-cancel"
                  onClick={() => { if (!approving) setShowApproveModal(false); }}
                  disabled={approving}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
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
                  style={{ flex: 1 }}
                >
                  Confirm Reject
                </button>
                <button
                  className="amp-btn-cancel"
                  onClick={() => setShowRejectModal(false)}
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
