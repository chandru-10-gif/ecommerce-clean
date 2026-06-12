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

  return (
    <div
      className="product-card card text-center d-flex flex-column align-items-center position-relative"
      onClick={singleProductGet}
    >
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

        <h5>₹ {props.price}</h5>

        <p>{props.category}</p>
      </div>
    </div>
  );
}