import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductListItem from "../components/ProductListItem";
import { modifyItem, removeitem } from "../redux/reducer/Cart";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

export default function Cart() {

  const list = useSelector(
    (state) => state.cart?.list || []
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const incrementItem = (item) => {
    dispatch(
      modifyItem({
        ...item,
        count: item.count + 1
      })
    );
  };

  const decrementItem = (item) => {

    if (item.count === 1) {

      dispatch(removeitem(item));

    } else {

      dispatch(
        modifyItem({
          ...item,
          count: item.count - 1
        })
      );
    }
  };

  const removeItemFromCart = (item) => {
    dispatch(removeitem(item));
  };

  return (

    <div className="container">

      <div className="mt-3">
        <BackButton />
      </div>

      <div className="mt-4 ">


        {list.length > 0 ? (
          <>

            {list.map((item) => (

              <ProductListItem
                key={item.id}
                {...item}

                incrementItem={(e) => {
                  e?.preventDefault?.();
                  incrementItem(item);
                }}

                decrementItem={(e) => {
                  e?.preventDefault?.();
                  decrementItem(item);
                }}

                removeItem={(e) => {
                  e?.preventDefault?.();
                  removeItemFromCart(item);
                }}
              />

            ))}

            <button
  className="btn btn-success mt-3 w-100 w-md-auto"
  onClick={() => navigate("/checkout")}
>
  Go To Checkout
</button>

          </>
        ) : (

          <h3 className="text-center mt-5">
            No items in the cart
          </h3>

        )}

      </div>

    </div>
  );
}