import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProductListItem from "../components/ProductListItem";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "./BackButton";
import { supabase } from "../services/supabase";
import AddressModal from "../customcomponents/AddressModal";

export default function Checkout() {
  const list = useSelector((state) => state.cart.list);
  const location = useLocation();

  const itemsFromRoute = location.state?.items;
  const [state, setState] = useState(itemsFromRoute || list);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses();
    fetchCurrentPrices();
  }, []);

  async function fetchCurrentPrices() {
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/products?limit=500`);
      const data = await res.json();
      const products = data.products || [];
      const map = {};
      products.forEach(p => { map[p.id] = p; });

      setState(prev => prev.map(item => {
        const fresh = map[item.id];
        if (fresh) {
          const hasOffer = (String(fresh.is_offer).toLowerCase() === "true" || fresh.is_offer === true || fresh.is_offer === 1) && fresh.offer_price && Number(fresh.offer_price) > 0;
          return {
            ...item,
            price: hasOffer ? Number(fresh.offer_price) : fresh.price,
            original_price: fresh.price,
            is_offer: fresh.is_offer,
            offer_price: fresh.offer_price,
          };
        }
        return item;
      }));
    } catch (err) {
      console.log("Could not fetch fresh prices", err);
    }
  }

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
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }

    // Check stock availability for all items
    const stockWarnings = [];
    for (const item of state) {
      if (item.count > (item.stock || 0)) {
        stockWarnings.push(
          `"${item.title}" - You ordered ${item.count} but only ${item.stock || 0} available`
        );
      }
    }

    if (stockWarnings.length > 0) {
      alert(
        "Some items have insufficient stock:\n\n" +
        stockWarnings.join("\n") +
        "\n\nPlease adjust quantities and try again."
      );
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    navigate("/payment", {
      state: {
        items: state,
        addressId: selectedAddressId,
        address: selectedAddress,
      },
    });
  };
  return (
    <div className="container">
      <div className="mt-3">
        <BackButton />
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mt-3 mb-3">Select Delivery Address</h4>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowAddressModal(true)}
        >
          + Add New Address
        </button>
      </div>

      {loadingAddresses ? (
        <p>Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="alert alert-warning">
          No addresses found.{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => setShowAddressModal(true)}
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

            <div className="card w-100 mt-3 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Order Summary</h5>
                {state.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <span>{item.title} x {item.count}</span>
                    {item.original_price && item.original_price !== item.price ? (
                      <span>
                        <span style={{ textDecoration: "line-through", color: "#999", marginRight: "6px", fontSize: "13px" }}>
                          ₹{item.original_price * item.count}
                        </span>
                        <strong>₹{item.price * item.count}</strong>
                      </span>
                    ) : (
                      <strong>₹{item.price * item.count}</strong>
                    )}
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total</strong>
                  <strong className="text-success">
                    ₹{state.reduce((sum, item) => sum + item.price * item.count, 0)}
                  </strong>
                </div>
              </div>
            </div>

            <button className="btn btn-success mt-3" onClick={placeOrder}>
              Proceed to Payment
            </button>
          </>
        ) : (
          <h3 className="text-center">No items in the cart</h3>
        )}
      </div>

      <AddressModal
        show={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSaved={async () => {
          setShowAddressModal(false);
          await fetchAddresses();
        }}
      />
    </div>
  );
}
