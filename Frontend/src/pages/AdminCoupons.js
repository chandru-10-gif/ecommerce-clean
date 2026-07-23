import React, { useEffect, useState } from "react";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../services/CouponService";

const emptyCoupon = {
  code: "",
  discount_type: "percent",
  discount_value: "",
  max_discount: "",
  min_order: "",
  expires_at: "",
  usage_limit: "",
  active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(emptyCoupon);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data.coupons || data || []);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discount_value: Number(formData.discount_value),
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        min_order: formData.min_order ? Number(formData.min_order) : 0,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id || editingCoupon._id, payload);
      } else {
        await createCoupon(payload);
      }
      setShowModal(false);
      setEditingCoupon(null);
      setFormData(emptyCoupon);
      loadCoupons();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      discount_type: coupon.discount_type || "percent",
      discount_value: coupon.discount_value || "",
      max_discount: coupon.max_discount || "",
      min_order: coupon.min_order || "",
      expires_at: coupon.expires_at ? coupon.expires_at.substring(0, 10) : "",
      usage_limit: coupon.usage_limit || "",
      active: coupon.active !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch (err) {
      console.log(err);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await updateCoupon(coupon.id || coupon._id, { active: !coupon.active });
      loadCoupons();
    } catch (err) {
      console.log(err);
    }
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData(emptyCoupon);
    setShowModal(true);
  };

  const filteredCoupons = coupons.filter(
    (c) => c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActive = coupons.filter((c) => c.active !== false).length;
  const totalInactive = coupons.filter((c) => c.active === false).length;

  return (
    <div className="amp-wrapper">
      <h2 className="amp-title">Manage Coupons</h2>

      <div className="amp-stats">
        <div className="amp-stat-card amp-stat-total">
          <span className="amp-stat-icon">🏷️</span>
          <span className="amp-stat-number">{coupons.length}</span>
          <span className="amp-stat-label">Total Coupons</span>
        </div>
        <div className="amp-stat-card amp-stat-stock">
          <span className="amp-stat-icon">✅</span>
          <span className="amp-stat-number">{totalActive}</span>
          <span className="amp-stat-label">Active</span>
        </div>
        <div className="amp-stat-card amp-stat-low">
          <span className="amp-stat-icon">⛔</span>
          <span className="amp-stat-number">{totalInactive}</span>
          <span className="amp-stat-label">Inactive</span>
        </div>
      </div>

      <div className="amp-toolbar">
        <div className="amp-search-wrap">
          <span className="amp-search-icon">🔍</span>
          <input
            type="text"
            className="amp-search-input"
            placeholder="Search coupons by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="amp-toolbar-actions">
          <button className="amp-add-btn" onClick={openAddModal}>
            <span className="amp-add-icon">+</span>
            Add Coupon
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="amp-empty">
          <span className="amp-empty-icon">🏷️</span>
          <p>No coupons found</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Code</th>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Type</th>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Value</th>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Max Discount</th>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Min Order</th>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Expiry</th>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Usage</th>
                <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Status</th>
                <th style={{ padding: "12px 15px", textAlign: "center", fontWeight: "600", color: "#333" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon, index) => (
                <tr
                  key={coupon.id || coupon._id}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    background: index % 2 === 0 ? "#fff" : "#fafafa",
                    animationDelay: `${index * 0.04}s`,
                  }}
                >
                  <td style={{ padding: "12px 15px", fontWeight: "700", color: "#0d6efd" }}>
                    {coupon.code}
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: coupon.discount_type === "percent" ? "#e7f1ff" : "#f0fdf4",
                        color: coupon.discount_type === "percent" ? "#0d6efd" : "#198754",
                      }}
                    >
                      {coupon.discount_type === "percent" ? "Percent" : "Flat"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 15px", fontWeight: "600" }}>
                    {coupon.discount_type === "percent" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    {coupon.max_discount ? `₹${coupon.max_discount}` : "—"}
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    ₹{coupon.min_order || 0}
                  </td>
                  <td style={{ padding: "12px 15px", fontSize: "13px", color: "#666" }}>
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString("en-IN")
                      : "No expiry"}
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    {coupon.usage_count || 0}{coupon.usage_limit ? `/${coupon.usage_limit}` : ""}
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    <button
                      onClick={() => toggleActive(coupon)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: coupon.active !== false ? "#d1e7dd" : "#f8d7da",
                        color: coupon.active !== false ? "#0f5132" : "#842029",
                      }}
                    >
                      {coupon.active !== false ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 15px", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(coupon)}
                      style={{
                        padding: "5px 12px",
                        border: "1px solid #0d6efd",
                        background: "#fff",
                        color: "#0d6efd",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        marginRight: "6px",
                      }}
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id || coupon._id)}
                      style={{
                        padding: "5px 12px",
                        border: "1px solid #dc3545",
                        background: "#fff",
                        color: "#dc3545",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="amp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="amp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="amp-modal-header">
              <div>
                <h3 className="amp-modal-title">{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
                <p className="amp-modal-subtitle">Fill in the coupon details below</p>
              </div>
              <button className="amp-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="amp-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Coupon Code</label>
                    <input
                      type="text"
                      name="code"
                      className="form-control"
                      placeholder="e.g. SAVE20"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Discount Type</label>
                    <select
                      name="discount_type"
                      className="form-select"
                      value={formData.discount_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Discount Value {formData.discount_type === "percent" ? "(%)" : "(₹)"}
                    </label>
                    <input
                      type="number"
                      name="discount_value"
                      className="form-control"
                      placeholder={formData.discount_type === "percent" ? "e.g. 10" : "e.g. 200"}
                      value={formData.discount_value}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Max Discount (₹)</label>
                    <input
                      type="number"
                      name="max_discount"
                      className="form-control"
                      placeholder="Optional - for percent coupons"
                      value={formData.max_discount}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Min Order (₹)</label>
                    <input
                      type="number"
                      name="min_order"
                      className="form-control"
                      placeholder="e.g. 500"
                      value={formData.min_order}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Expiry Date</label>
                    <input
                      type="date"
                      name="expires_at"
                      className="form-control"
                      value={formData.expires_at}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Usage Limit</label>
                    <input
                      type="number"
                      name="usage_limit"
                      className="form-control"
                      placeholder="Optional - leave blank for unlimited"
                      value={formData.usage_limit}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="active"
                        className="form-check-input"
                        id="couponActive"
                        checked={formData.active}
                        onChange={handleChange}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <label className="form-check-label fw-semibold ms-2" htmlFor="couponActive" style={{ cursor: "pointer" }}>
                        Active
                      </label>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "25px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
