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
        className="mb-3 mb-md-0 me-md-4"
        style={{
          width: "150px",
          height: "150px",
          objectFit: "contain",
        }}
      />

      <div className="flex-grow-1 text-center text-md-start">
        <h5>{props.title}</h5>

        <h6>Price: ₹ {props.price}</h6>

        <h6>Category: {props.category}</h6>

        <h6>Rating: {props.rating?.rate}</h6>

        <h6>Reviews: {props.rating?.count}</h6>

        <div className="mt-3 d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
          <button
            className="btn btn-danger "
            onClick={props.incrementItem}
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
        </div>
      </div>
    </div>
  );
}