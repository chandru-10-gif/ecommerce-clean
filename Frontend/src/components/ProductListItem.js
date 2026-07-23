import React from "react";

export default function ProductListItem(props) {
  return (
    <div
      className="d-flex align-items-center justify-content-between border rounded p-3 mb-4 shadow-sm"

style={{
  width: "100%",
  backgroundColor: "white"
}}
    >
      <img
        src={props.image}
        alt={props.title}
        className="mb-3 mb-md-0 me-md-4 product-list-image"
        style={{
          width: "150px",
          height: "150px",
          objectFit: "contain",
        }}
      />

      <div className="flex-grow-1 text-center text-md-start">
        <h5>{props.title}</h5>

        {props.original_price && props.original_price !== props.price ? (
          <h6>
            <span style={{ textDecoration: "line-through", color: "#999", marginRight: "8px" }}>
              ₹ {props.original_price}
            </span>
            <span style={{ color: "#ff4444", fontWeight: "700" }}>
              ₹ {props.price}
            </span>
          </h6>
        ) : (
          <h6>Price: ₹ {props.price}</h6>
        )}

        <h6>Category: {props.category}</h6>

        <h6>Rating: {props.rating?.rate}</h6>

        <h6>Reviews: {props.rating?.count}</h6>
       <p className="text-success fw-bold">
  Stock : {props.stock}
</p>

<button
  className="btn btn-success"
  onClick={props.incrementItem}
  disabled={props.count >= props.stock}
>
  +
</button>
          <span>Quantity: {props.count}</span>

          <button
            className="btn btn-danger "
            onClick={props.decrementItem}
          >
            -
          </button>

          <button
            className="btn btn-danger "
            onClick={props.removeItem}
          >
            Remove
          </button>

          {props.buyItem && (
            <button
              className="btn btn-success  "
              onClick={props.buyItem}
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    
  );
}