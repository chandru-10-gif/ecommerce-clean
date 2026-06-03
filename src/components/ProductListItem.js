import React from "react";

export default function ProductListItem(props) {
  return (
    <div
      className="d-flex align-items-center justify-content-between border rounded p-3 mb-4 shadow-sm"
      style={{
        width: "800px",
        backgroundColor: "white",
      }}
    >
      <img
        src={props.image}
        alt={props.title}
        className="me-4"
        style={{
          width: "200px",
          height: "200px",
          objectFit: "contain",
        }}
      />

      <div>
        <h5>{props.title}</h5>

        <h6>Price: ₹ {props.price}</h6>

        <h6>Category: {props.category}</h6>

        <h6>Rating: {props.rating?.rate}</h6>

        <h6>Reviews: {props.rating?.count}</h6>

        <div className="mt-3">
          <button
            className="btn btn-danger me-3"
            onClick={props.incrementItem}
          >
            +
          </button>

          <span>Quantity: {props.count}</span>

          <button
            className="btn btn-danger ms-3"
            onClick={props.decrementItem}
          >
            -
          </button>

          <button
            className="btn btn-danger ms-3"
            onClick={props.removeItem}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}