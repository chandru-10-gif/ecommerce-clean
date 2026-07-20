import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProductListItem from "../components/ProductListItem";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "./BackButton";
import { supabase } from "../services/supabase";

export default function Checkout() {
  const list = useSelector((state) => state.cart.list);
  const location = useLocation();

  const itemsFromRoute = location.state?.items;
  const [state, setState] = useState(itemsFromRoute || list);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingAddresses(false);
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAddresses(data);
      const defaultAddr = data.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    }

    setLoadingAddresses(false);
  }

const incrementItem = (item) => {
  if (item.count >= item.stock) {
    alert(`Only ${item.stock} items are available in stock.`);
    return;
  }

  setState((prev) =>
    prev.map((product) =>
      product.id === item.id
        ? { ...product, count: product.count + 1 }
        : product
    )
  );
};

const decrementItem = (item) => {
  if (item.count === 1) {
    removeItemFromCart(item);
    return;
  }

  setState((prev) =>
    prev.map((product) =>
      product.id === item.id
        ? { ...product, count: product.count - 1 }
        : product
    )
  );
};

const removeItemFromCart = (item) => {
  setState((prev) =>
    prev.filter((product) => product.id !== item.id)
  );
};

  const placeOrder = async () => {
  try {

   const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("Session:", session);
    console.log("CART ITEMS:", state);

    // Get logged-in user
  const user = JSON.parse(
  localStorage.getItem("user")
);

if (!user) {
  alert("Please login first");
  navigate("/login");
  return;
}

if (!selectedAddressId) {
  alert("Please select a delivery address");
  return;
}



    // Calculate total
    const totalAmount = state.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    console.log("User:", user.id);
    console.log("Total Amount:", totalAmount);

    // Create order
    const { data: order, error } = await supabase
  .from("orders")
  .insert({
    user_id: user.id,
    total_amount: totalAmount,
    status: "Pending",
    address_id: selectedAddressId,
  })
  .select()
  .single();

if (error) throw error;

    console.log("Order Created:", order);

    // Create order items
    const orderItems = state.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_title: item.title,
      image: item.image,
      quantity: item.count,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    console.log("Order Items Saved");

    // Success page
    navigate("/success");
  } catch (err) {
    console.error("Order Error:", err);
    alert(err.message);
  }
};
  return (
    <div className="container">
      <div className="mt-3">
        <BackButton />
      </div>

      <h4 className="mt-3 mb-3">Select Delivery Address</h4>

      {loadingAddresses ? (
        <p>Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="alert alert-warning">
          No addresses found.{" "}
         <button
  className="btn btn-link p-0"
  onClick={() =>
    navigate("/edit-profile", {
      state:{
        openAddress:true
      }
    })
  }
>
 Add an address
</button>
        </div>
      ) : (
        <div className="row mb-4">
          {addresses.map((address) => (
            <div className="col-md-6 mb-3" key={address.id}>
              <div
                className={`card h-100 ${
                  selectedAddressId === address.id
                    ? "border-success border-2"
                    : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <strong>{address.full_name}</strong>
                        {address.is_default && (
                          <span className="badge bg-success ms-2">
                            Default
                          </span>
                        )}
                      </h6>
                      <small className="text-muted">
                        {address.address_type}
                      </small>
                    </div>
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                  </div>
                  <hr className="my-2" />
                  <p className="mb-1">{address.phone}</p>
                  <p className="mb-1">{address.address_line1}</p>
                  {address.address_line2 && (
                    <p className="mb-1">{address.address_line2}</p>
                  )}
                  <p className="mb-1">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="mb-0">{address.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="d-flex flex-column align-items-center mt-3">
        {state.length > 0 ? (
          <>
            {state.map((item) => (
              <ProductListItem
                key={item.id}
                {...item}
                incrementItem={() => incrementItem(item)}
                decrementItem={() => decrementItem(item)}
                removeItem={() => removeItemFromCart(item)}
              />
            ))}

            <button className="btn btn-success mt-3" onClick={placeOrder}>
              Place Order
            </button>
          </>
        ) : (
          <h3 className="text-center">No items in the cart</h3>
        )}
      </div>
    </div>
  );
}
