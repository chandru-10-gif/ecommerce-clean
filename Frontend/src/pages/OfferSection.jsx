import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function OfferSection() {
  const navigate = useNavigate();
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? offerProducts.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === offerProducts.length - 1 ? 0 : prev + 1));
  };

  if (loading || offerProducts.length === 0) return null;

  const product = offerProducts[currentIndex];
  const discount = Math.round(
    ((product.price - product.offer_price) / product.price) * 100
  );

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

      {/* BIG BANNER WITH ARROWS */}
      <div
        style={{
          position: "relative",
          background: "#fff8f8",
          borderRadius: "0 0 12px 12px",
          padding: "20px",
        }}
      >
        {/* LEFT ARROW */}
        <button
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.9)",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: "22px",
            fontWeight: "700",
            color: "#333",
          }}
        >
          <Icon icon="mdi:chevron-left" width="28" height="28" />
        </button>

        {/* PRODUCT BANNER */}
        <div
          onClick={() => navigate(`/product/${product.id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            minHeight: "350px",
          }}
        >
          {/* BIG IMAGE */}
          <div
            style={{
              flex: "0 0 55%",
              maxWidth: "55%",
              height: "400px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x400?text=No+Image";
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                background: "#ff4444",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "800",
              }}
            >
              {discount}% OFF
            </span>
          </div>

          {/* PRODUCT INFO */}
          <div style={{ flex: 1, padding: "30px" }}>
            <h2
              style={{
                fontWeight: "700",
                marginBottom: "12px",
                fontSize: "24px",
                color: "#222",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.title}
            </h2>

            <p
              style={{
                color: "#666",
                fontSize: "14px",
                marginBottom: "16px",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  color: "#999",
                  textDecoration: "line-through",
                  fontSize: "20px",
                }}
              >
                ₹{product.price}
              </span>
              <span
                style={{
                  color: "#ff4444",
                  fontWeight: "800",
                  fontSize: "28px",
                }}
              >
                ₹{product.offer_price}
              </span>
            </div>

            <button
              style={{
                padding: "12px 32px",
                background: "#ff4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* RIGHT ARROW */}
        <button
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.9)",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: "22px",
            fontWeight: "700",
            color: "#333",
          }}
        >
          <Icon icon="mdi:chevron-right" width="28" height="28" />
        </button>

        {/* DOTS NAVIGATION */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          {offerProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? "24px" : "10px",
                height: "10px",
                borderRadius: "5px",
                border: "none",
                background: idx === currentIndex ? "#ff4444" : "#ddd",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
