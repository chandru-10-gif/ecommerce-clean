import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addWishlist } from "../redux/reducer/Wishlist";
import { Icon } from "@iconify/react";


export default function ProductCart(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(false);

  const singleProductGet = () => {
    navigate(`/product/${props.id}`);
  };

  const hasOffer = (String(props.is_offer).toLowerCase() === "true" || props.is_offer === true || props.is_offer === 1) && props.offer_price && Number(props.offer_price) > 0;
  const discountPercent = hasOffer
    ? Math.round(((props.price - props.offer_price) / props.price) * 100)
    : 0;

  return (
    <div
      className="product-card card text-center d-flex flex-column align-items-center position-relative"
      onClick={singleProductGet}
      style={{
        opacity: props.stock !== undefined && props.stock <= 0 ? 0.55 : 1,
        pointerEvents: props.stock !== undefined && props.stock <= 0 ? "none" : "auto",
      }}
    >
      {hasOffer && (
        <span
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            background: "#ff4444",
            color: "white",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "700",
            zIndex: 2,
          }}
        >
          {discountPercent}% OFF
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();

          setWishlist(!wishlist);

          dispatch(
            addWishlist({
              id: props.id,
              title: props.title,
              price: props.price,
              image: props.image,
              category: props.category,
            })
          );
        }}
        className="wishlist-btn"
      >
        <Icon
          icon={wishlist ? "mdi:heart" : "mdi:heart-outline"}
          width="22"
          height="22"
          color={wishlist ? "red" : "#333"}
        />
      </button>

      <img
        src={props.image}
        alt={props.title}
        className="product-card-image"
        style={{
          width: "200px",
          height: "200px",
          border: "2px solid red",
          objectFit: "cover"
        }}
        onError={() => console.log("FAILED IMAGE:", props.image)}
        onLoad={() => console.log("IMAGE LOADED:", props.image)}
      />


      <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
        <h6 className="product-title">
          {props.title}
        </h6>

        {hasOffer ? (
          <div className="d-flex align-items-center gap-2">
            <h5 style={{ color: "#999", textDecoration: "line-through", fontSize: "14px", marginBottom: 0 }}>
              ₹ {props.price}
            </h5>
            <h5 style={{ color: "#ff4444", fontWeight: "700", marginBottom: 0 }}>
              ₹ {props.offer_price}
            </h5>
          </div>
        ) : (
          <h5>₹ {props.price}</h5>
        )}

        <p>{props.category}</p>

        {/* Stock Badge */}
        {props.stock > 5 ? (
          <span
            className="badge mb-2"
            style={{ background: "#198754", color: "#fff", fontSize: "11px" }}
          >
            In Stock
          </span>
        ) : props.stock > 0 ? (
          <span
            className="badge mb-2"
            style={{ background: "#ffc107", color: "#333", fontSize: "11px" }}
          >
            Low Stock
          </span>
        ) : (
          <span
            className="badge mb-2"
            style={{ background: "#dc3545", color: "#fff", fontSize: "11px" }}
          >
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
}
