import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function OfferSection() {
  const navigate = useNavigate();
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/products`,
          { params: { page: 1, limit: 500, search: "" } }
        );
        const allProducts = res.data.products || [];
        const offers = allProducts.filter(
          (p) => {
            const isOffer = String(p.is_offer).toLowerCase() === "true" || p.is_offer === true || p.is_offer === 1;
            const hasPrice = p.offer_price && Number(p.offer_price) > 0;
            return isOffer && hasPrice;
          }
        );
        setOfferProducts(offers);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading || offerProducts.length === 0) return null;

  return (
    <div style={{ margin: "0 0 20px 0", padding: "0" }}>

      {/* BANNER HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)",
          color: "white",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "12px 12px 0 0",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h3 style={{ fontWeight: "800", margin: 0, fontSize: "20px" }}>
            Today's Deals
          </h3>
          <p style={{ margin: "2px 0 0 0", fontSize: "13px", opacity: 0.9 }}>
            Grab the best offers before they're gone!
          </p>
        </div>
        <span
          style={{
            background: "white",
            color: "#ff4444",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {offerProducts.length} Deals
        </span>
      </div>

      {/* ALL OFFER PRODUCTS - HORIZONTAL SCROLL */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          overflowX: "auto",
          padding: "20px 5px",
          background: "#fff8f8",
          borderRadius: "0 0 12px 12px",
          scrollBehavior: "smooth",
        }}
      >
        {offerProducts.map((product) => {
          const discount = Math.round(
            ((product.price - product.offer_price) / product.price) * 100
          );

          return (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              style={{
                minWidth: "200px",
                maxWidth: "200px",
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                flexShrink: 0,
                border: "1px solid #fee2e2",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={product.image}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200x160?text=No+Image";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "#ff4444",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {discount}% OFF
                </span>
              </div>

              <div style={{ padding: "10px" }}>
                <h6
                  style={{
                    fontWeight: "600",
                    marginBottom: "6px",
                    fontSize: "13px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.title}
                </h6>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      color: "#999",
                      textDecoration: "line-through",
                      fontSize: "12px",
                    }}
                  >
                    ₹{product.price}
                  </span>
                  <span
                    style={{
                      color: "#ff4444",
                      fontWeight: "700",
                      fontSize: "15px",
                    }}
                  >
                    ₹{product.offer_price}
                  </span>
                </div>
                <button
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "6px",
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
