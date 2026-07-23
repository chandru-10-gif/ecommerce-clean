import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOffers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products`, {
        params: { limit: 100 },
      });
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOffer = async (product) => {
    try {
      const updated = {
        ...product,
        is_offer: !product.is_offer,
        offer_price: product.is_offer ? null : product.offer_price,
      };

      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/products/${product.id}`, updated);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, is_offer: !p.is_offer, offer_price: !p.is_offer ? p.offer_price : null }
            : p
        )
      );
    } catch (err) {
      console.log("Error toggling offer:", err);
      alert("Failed to update offer");
    }
  };

  const updateOfferPrice = async (product, newPrice) => {
    try {
      const updated = {
        ...product,
        offer_price: Number(newPrice),
      };

      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/products/${product.id}`, updated);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, offer_price: Number(newPrice) } : p
        )
      );
    } catch (err) {
      console.log("Error updating offer price:", err);
    }
  };

  const offerProducts = products.filter((p) => p.is_offer);
  const nonOfferProducts = products.filter((p) => !p.is_offer);

  if (loading) {
    return <h4 className="text-center mt-5">Loading...</h4>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="fw-bold mb-4">Manage Offers</h2>

      <div style={{
        background: "#fff3cd",
        border: "1px solid #ffc107",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "25px",
      }}>
        <strong>How Offers Work:</strong>
        <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", fontSize: "14px" }}>
          <li>Toggle the <strong>Offer</strong> switch to mark a product as on sale</li>
          <li>Set an <strong>Offer Price</strong> (discounted price) for the product</li>
          <li>Offer products appear in the <strong>"Today's Deals"</strong> section on the homepage</li>
          <li>Products show a <strong>% OFF badge</strong> and strikethrough original price</li>
        </ul>
      </div>

      {offerProducts.length > 0 && (
        <>
          <h4 style={{ color: "#ff4444", fontWeight: "700", marginBottom: "15px" }}>
            Active Offers ({offerProducts.length})
          </h4>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}>
            {offerProducts.map((product) => {
              const discount = product.offer_price
                ? Math.round(((product.price - product.offer_price) / product.price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "2px solid #ff4444",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(255,68,68,0.15)",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", padding: "12px" }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80?text=No+Image";
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h6 style={{ fontWeight: "600", marginBottom: "4px" }}>{product.title}</h6>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{product.category}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ textDecoration: "line-through", color: "#999", fontSize: "13px" }}>
                          ₹ {product.price}
                        </span>
                        <span style={{ color: "#ff4444", fontWeight: "700", fontSize: "15px" }}>
                          ₹ {product.offer_price || "Set price"}
                        </span>
                        {discount > 0 && (
                          <span style={{
                            background: "#ff4444",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}>
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "0 12px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="number"
                      placeholder="Offer Price"
                      value={product.offer_price || ""}
                      onChange={(e) => updateOfferPrice(product, e.target.value)}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    />
                    <button
                      onClick={() => toggleOffer(product)}
                      style={{
                        padding: "6px 14px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h4 style={{ fontWeight: "600", marginBottom: "15px" }}>
        All Products ({nonOfferProducts.length} not on offer)
      </h4>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "15px",
      }}>
        {nonOfferProducts.map((product) => (
          <div
            key={product.id}
            style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
              boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", gap: "12px", padding: "12px" }}>
              <img
                src={product.image}
                alt={product.title}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80?text=No+Image";
                }}
              />
              <div style={{ flex: 1 }}>
                <h6 style={{ fontWeight: "600", marginBottom: "4px" }}>{product.title}</h6>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{product.category}</p>
                <span style={{ fontWeight: "700", fontSize: "15px" }}>₹ {product.price}</span>
              </div>
            </div>

            <div style={{ padding: "0 12px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="number"
                placeholder="Offer Price"
                value={product.offer_price || ""}
                onChange={(e) => updateOfferPrice(product, e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
              <button
                onClick={() => toggleOffer(product)}
                style={{
                  padding: "6px 14px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Add Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
