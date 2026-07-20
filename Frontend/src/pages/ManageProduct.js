import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddProduct from "./AddProduct";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        params: { limit: 100 },
      });
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      loadProducts();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit/${id}`);
  };

  const filteredProducts = products.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter((p) => Number(p.stock) <= 5).length;
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="amp-wrapper">
      <h2 className="amp-title">Manage Products</h2>

      <div className="amp-stats">
        <div className="amp-stat-card amp-stat-total">
          <span className="amp-stat-icon">📦</span>
          <span className="amp-stat-number">{products.length}</span>
          <span className="amp-stat-label">Total Products</span>
        </div>
        <div className="amp-stat-card amp-stat-category">
          <span className="amp-stat-icon">🏷️</span>
          <span className="amp-stat-number">{categories.length}</span>
          <span className="amp-stat-label">Categories</span>
        </div>
        <div className="amp-stat-card amp-stat-stock">
          <span className="amp-stat-icon">🏬</span>
          <span className="amp-stat-number">{totalStock}</span>
          <span className="amp-stat-label">Total Stock</span>
        </div>
        <div className="amp-stat-card amp-stat-low">
          <span className="amp-stat-icon">⚠️</span>
          <span className="amp-stat-number">{lowStockCount}</span>
          <span className="amp-stat-label">Low Stock</span>
        </div>
      </div>

      <div className="amp-toolbar">
        <div className="amp-search-wrap">
          <span className="amp-search-icon">🔍</span>
          <input
            type="text"
            className="amp-search-input"
            placeholder="Search products by name or category..."
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
          <button className="amp-add-btn" onClick={() => setShowModal(true)}>
            <span className="amp-add-icon">+</span>
            Add Product
          </button>
        </div>
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
                {Number(item.stock) <= 5 && (
                  <span className="amp-card-low-stock">Low Stock</span>
                )}
              </div>
              <div className="amp-card-body">
                <h4 className="amp-card-title">{item.title}</h4>
                <div className="amp-card-details">
                  <div className="amp-card-price">₹{item.price}</div>
                  <div className="amp-card-stock">
                    Stock: <strong>{item.stock ?? "N/A"}</strong>
                  </div>
                </div>
                <p className="amp-card-desc">
                  {item.description?.substring(0, 80) || "No description"}
                  {item.description?.length > 80 ? "..." : ""}
                </p>
                <div className="amp-card-actions">
                  <button
                    className="amp-btn-edit"
                    onClick={() => handleEdit(item.id || item._id)}
                  >
                    ✎ Edit
                  </button>
                  <button
                    className="amp-btn-delete"
                    onClick={() => handleDelete(item.id || item._id)}
                  >
                    🗑 Delete
                  </button>
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
                  <span className="amp-list-stock">Stock: {item.stock ?? "N/A"}</span>
                </div>
              </div>
              <div className="amp-list-actions">
                <button
                  className="amp-btn-edit"
                  onClick={() => handleEdit(item.id || item._id)}
                >
                  ✎ Edit
                </button>
                <button
                  className="amp-btn-delete"
                  onClick={() => handleDelete(item.id || item._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="amp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="amp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="amp-modal-header">
              <div>
                <h3 className="amp-modal-title">Add New Product</h3>
                <p className="amp-modal-subtitle">Fill in the details below</p>
              </div>
              <button
                className="amp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="amp-modal-body">
              <AddProduct
                onSuccess={() => {
                  loadProducts();
                  setShowModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
