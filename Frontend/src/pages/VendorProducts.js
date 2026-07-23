import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorProducts, deleteVendorProduct, updateVendorStock } from "../services/VendorService";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
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
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (activeTab !== "all") {
      filtered = filtered.filter((p) => p.approval_status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, activeTab, searchTerm]);

  const loadProducts = async () => {
    const vendorId = getVendorId();
    if (!vendorId) return;

    try {
      const data = await getVendorProducts(vendorId);
      setProducts(data.products || data);
    } catch (err) {
      console.log("Error loading products:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteVendorProduct(id);
      loadProducts();
    } catch (err) {
      console.log("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete product");
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    if (newStock < 0) return;
    try {
      await updateVendorStock(id, { stock: newStock });
      loadProducts();
    } catch (err) {
      console.log("Stock update error:", err);
      alert(err.response?.data?.error || "Failed to update stock");
    }
  };

  const canEdit = (status) => status === "pending" || status === "rejected";

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

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="amp-wrapper">
      <h2 className="amp-title">My Products</h2>

      <div className="amp-toolbar">
        <div className="amp-search-wrap">
          <span className="amp-search-icon">🔍</span>
          <input
            type="text"
            className="amp-search-input"
            placeholder="Search products by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="amp-toolbar-actions">
          <div className="amp-view-toggle">
            <button
              className={`amp-view-btn ${viewMode === "grid" ? "amp-view-active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              ▦
            </button>
            <button
              className={`amp-view-btn ${viewMode === "list" ? "amp-view-active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰
            </button>
          </div>
          <button className="amp-add-btn" onClick={() => navigate("/vendor/add-product")}>
            <span className="amp-add-icon">+</span>
            Add Product
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "6px 18px",
              borderRadius: "20px",
              border: activeTab === tab.key ? "2px solid #667eea" : "2px solid #ddd",
              background: activeTab === tab.key ? "#667eea" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#333",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="amp-empty">
          <span className="amp-empty-icon">📭</span>
          <p>No products found</p>
        </div>
      ) : viewMode === "grid" ? (
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
                <span className="amp-card-category">{item.category || "Uncategorized"}</span>
              </div>
              <div className="amp-card-body">
                <h4 className="amp-card-title">{item.title}</h4>
                <div style={{ marginBottom: "8px" }}>{getStatusBadge(item.approval_status)}</div>
                {item.approval_status === "rejected" && item.admin_notes && (
                  <div
                    style={{
                      padding: "8px",
                      background: "#f8d7da",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#721c24",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Rejection reason:</strong> {item.admin_notes}
                  </div>
                )}
                <div className="amp-card-details">
                  <div className="amp-card-price">₹{item.price}</div>
                  {item.approval_status === "approved" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#666" }}>Stock:</span>
                      <button
                        onClick={() => handleStockUpdate(item.id || item._id, Number(item.stock) - 1)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          background: "#f0f0f0",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        -
                      </button>
                      <strong style={{ minWidth: "24px", textAlign: "center" }}>{item.stock ?? 0}</strong>
                      <button
                        onClick={() => handleStockUpdate(item.id || item._id, Number(item.stock) + 1)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          background: "#f0f0f0",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="amp-card-stock">
                      Stock: <strong>{item.stock ?? "N/A"}</strong>
                    </div>
                  )}
                </div>
                <p className="amp-card-desc">
                  {item.description?.substring(0, 80) || "No description"}
                  {item.description?.length > 80 ? "..." : ""}
                </p>
                <div className="amp-card-actions">
                  {canEdit(item.approval_status) && (
                    <button
                      className="amp-btn-edit"
                      onClick={() => navigate(`/vendor/edit-product/${item.id || item._id}`)}
                    >
                      ✎ Edit
                    </button>
                  )}
                  {canEdit(item.approval_status) && (
                    <button
                      className="amp-btn-delete"
                      onClick={() => handleDelete(item.id || item._id)}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="amp-product-list">
          {filteredProducts.map((item, index) => (
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
                  {item.approval_status === "approved" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>Stock:</span>
                      <button
                        onClick={() => handleStockUpdate(item.id || item._id, Number(item.stock) - 1)}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          background: "#f0f0f0",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        -
                      </button>
                      <strong>{item.stock ?? 0}</strong>
                      <button
                        onClick={() => handleStockUpdate(item.id || item._id, Number(item.stock) + 1)}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          background: "#f0f0f0",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="amp-list-stock">Stock: {item.stock ?? "N/A"}</span>
                  )}
                </div>
                {item.approval_status === "rejected" && item.admin_notes && (
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "6px 10px",
                      background: "#f8d7da",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "#721c24",
                    }}
                  >
                    <strong>Rejection reason:</strong> {item.admin_notes}
                  </div>
                )}
              </div>
              <div className="amp-list-actions">
                {canEdit(item.approval_status) && (
                  <button
                    className="amp-btn-edit"
                    onClick={() => navigate(`/vendor/edit-product/${item.id || item._id}`)}
                  >
                    ✎ Edit
                  </button>
                )}
                {canEdit(item.approval_status) && (
                  <button
                    className="amp-btn-delete"
                    onClick={() => handleDelete(item.id || item._id)}
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
