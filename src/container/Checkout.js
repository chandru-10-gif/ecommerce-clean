import React, { useState } from "react";
import { useSelector } from "react-redux";
import ProductListItem from "../components/ProductListItem";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

export default function Checkout() {

  const list = useSelector(
    (state) => state.cart.list
  );

  const [state, setState] = useState(list);

  const navigate = useNavigate();

  const incrementItem = (item) => {

    const index = state.findIndex(
      (product) => product._id === item.id
    );

    setState((state) => [
      ...state.slice(0, index),

      {
        ...item,
        count: item.count + 1
      },

      ...state.slice(index + 1),
    ]);
  };

  const decrementItem = (item) => {

    if (item.count === 1) {

      removeItemFromCart(item);

    } else {

      const index = state.findIndex(
        (product) => product._id === item.id
      );

      setState((state) => [
        ...state.slice(0, index),

        {
          ...item,
          count: item.count - 1
        },

        ...state.slice(index + 1),
      ]);
    }
  };

  const removeItemFromCart = (item) => {

    const index = state.findIndex(
      (product) => product._id === item.id
    );

    setState((state) => [
      ...state.slice(0, index),
      ...state.slice(index + 1),
    ]);
  };

  return (

    <div className="container">

      <div className="mt-3">
        <BackButton />
      </div>

      <div className="d-flex flex-column align-items-center mt-5">

        {state.length > 0 ? (
          <>

            {state.map((item) => (
              <ProductListItem
                key={item.id}
                {...item}
                incrementItem={() =>
                  incrementItem(item)
                }
                decrementItem={() =>
                  decrementItem(item)
                }
                removeItem={() =>
                  removeItemFromCart(item)
                }
              />
            ))}

            <button
              className="btn btn-success mt-3"
              onClick={() =>
                navigate("/success")
              }
            >
              Place Order
            </button>

          </>
        ) : (

          <h3 className="text-center">
            No items in the cart
          </h3>

        )}

      </div>

    </div>
  );
}