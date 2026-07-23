import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import BackButton from "./BackButton";
import { Icon } from "@iconify/react";
import { validateCoupon } from "../services/CouponService";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state || {};
  const [items, setItems] = useState(locationState.items || []);
  const addressId = locationState.addressId || null;

  const [selectedMethod, setSelectedMethod] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Net banking
  const [selectedBank, setSelectedBank] = useState("");

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState("");

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart");
      return;
    }
    fetchFreshPrices();
  }, [items, navigate]);

  async function fetchFreshPrices() {
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/products?limit=500`);
      const data = await res.json();
      const products = data.products || [];
      const map = {};
      products.forEach(p => { map[p.id] = p; });

      const updated = items.map(item => {
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
      });
      setItems(updated);
    } catch (err) {
      console.log("Could not fetch fresh prices", err);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.count, 0);
  const shipping = subtotal > 500 ? 0 : 49;
  const GST_RATE = 0.18;
  const gstAmount = Math.round(subtotal * GST_RATE);
  const totalBeforeDiscount = subtotal + shipping + gstAmount;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percent" || appliedCoupon.type === "percent") {
      const rate = appliedCoupon.discount_value || appliedCoupon.discount || 0;
      const max = appliedCoupon.max_discount || appliedCoupon.maxDiscount || Infinity;
      discount = Math.min((subtotal * rate) / 100, max);
    } else {
      discount = appliedCoupon.discount_value || appliedCoupon.discount || 0;
    }
  }

  const total = subtotal + shipping + gstAmount - discount;

  const applyCoupon = async () => {
    setCouponError("");
    setAppliedCoupon(null);

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      const result = await validateCoupon(code, subtotal);
      if (result.valid) {
        setAppliedCoupon(result.coupon);
      } else {
        setCouponError(result.message || "Invalid coupon code");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Invalid coupon code";
      setCouponError(message);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const validateForm = () => {
    if (!selectedMethod) {
      alert("Please select a payment method");
      return false;
    }

    if (selectedMethod === "credit_card" || selectedMethod === "debit_card") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
        alert("Please enter a valid card number");
        return false;
      }
      if (!cardName.trim()) {
        alert("Please enter cardholder name");
        return false;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        alert("Please enter valid expiry (MM/YY)");
        return false;
      }
      if (!cardCvv || cardCvv.length < 3) {
        alert("Please enter valid CVV");
        return false;
      }
    }

    if (selectedMethod === "net_banking" && !selectedBank) {
      alert("Please select a bank");
      return false;
    }

    if (selectedMethod === "wallet" && !selectedWallet) {
      alert("Please select a wallet");
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          status: "Pending",
          address_id: addressId,
          payment_method: selectedMethod,
        })
        .select()
        .single();

      if (error) throw error;

      const orderItems = items.map((item) => ({
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

      navigate("/success", {
        state: {
          orderId: order.id,
          total: total,
          paymentMethod: selectedMethod,
          itemCount: items.length,
        },
      });
    } catch (err) {
      console.error("Order Error:", err);
      alert(err.message || "Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, "").substring(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, "").substring(0, 4);
    if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2);
    return v;
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case "credit_card": return "mdi:credit-card-outline";
      case "debit_card": return "mdi:credit-card-outline";
      case "net_banking": return "mdi:bank-outline";
      case "cod": return "mdi:cash";
      case "wallet": return "mdi:wallet-outline";
      default: return "mdi:credit-card";
    }
  };

  const getPaymentLabel = (method) => {
    switch (method) {
      case "credit_card": return "Credit Card";
      case "debit_card": return "Debit Card";
      case "net_banking": return "Net Banking";
      case "cod": return "Cash on Delivery";
      case "wallet": return "Wallet";
      default: return method;
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="container" style={{ paddingBottom: "30px" }}>
      <div className="mt-3">
        <BackButton />
      </div>

      <h4 className="mt-3 mb-4 fw-bold">Payment</h4>

      <div className="row">
        {/* LEFT - PAYMENT OPTIONS */}
        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Select Payment Method</h5>

              {/* Payment Methods */}
              {[
                { id: "credit_card", label: "Credit Card", icon: "mdi:credit-card-outline", desc: "Visa, Mastercard, Rupay" },
                { id: "debit_card", label: "Debit Card", icon: "mdi:credit-card-outline", desc: "All bank debit cards" },
                { id: "net_banking", label: "Net Banking", icon: "mdi:bank-outline", desc: "All major banks" },
                { id: "wallet", label: "Wallet", icon: "mdi:wallet-outline", desc: "Paytm, PhonePe, GPay" },
                { id: "cod", label: "Cash on Delivery", icon: "mdi:cash", desc: "Pay when you receive" },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "15px",
                    border: selectedMethod === method.id ? "2px solid #198754" : "1px solid #e0e0e0",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    background: selectedMethod === method.id ? "#f0fdf4" : "#fff",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "10px",
                    background: selectedMethod === method.id ? "#198754" : "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px",
                  }}>
                    <Icon
                      icon={method.icon}
                      width="24"
                      color={selectedMethod === method.id ? "#fff" : "#666"}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", fontSize: "15px" }}>{method.label}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{method.desc}</div>
                  </div>
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: selectedMethod === method.id ? "2px solid #198754" : "2px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {selectedMethod === method.id && (
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#198754" }} />
                    )}
                  </div>
                </div>
              ))}

              {/* CREDIT/DEBIT CARD FORM */}
              {(selectedMethod === "credit_card" || selectedMethod === "debit_card") && (
                <div style={{ marginTop: "15px", padding: "20px", background: "#f8f9fa", borderRadius: "10px" }}>
                  <h6 className="fw-bold mb-3">{selectedMethod === "credit_card" ? "Credit" : "Debit"} Card Details</h6>
                  <div className="mb-3">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NET BANKING */}
              {selectedMethod === "net_banking" && (
                <div style={{ marginTop: "15px", padding: "20px", background: "#f8f9fa", borderRadius: "10px" }}>
                  <h6 className="fw-bold mb-3">Select Your Bank</h6>
                  <div className="row">
                    {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "BOB", "Canara"].map((bank) => (
                      <div className="col-6 mb-2" key={bank}>
                        <div
                          onClick={() => setSelectedBank(bank)}
                          style={{
                            padding: "10px 15px",
                            border: selectedBank === bank ? "2px solid #198754" : "1px solid #ddd",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background: selectedBank === bank ? "#f0fdf4" : "#fff",
                            textAlign: "center",
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          {bank}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WALLET */}
              {selectedMethod === "wallet" && (
                <div style={{ marginTop: "15px", padding: "20px", background: "#f8f9fa", borderRadius: "10px" }}>
                  <h6 className="fw-bold mb-3">Select Wallet</h6>
                  {["Paytm", "PhonePe", "Google Pay", "Amazon Pay", "Mobikwik"].map((wallet) => (
                    <div
                      key={wallet}
                      onClick={() => setSelectedWallet(wallet)}
                      style={{
                        padding: "12px 15px",
                        border: selectedWallet === wallet ? "2px solid #198754" : "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: selectedWallet === wallet ? "#f0fdf4" : "#fff",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {wallet}
                    </div>
                  ))}
                </div>
              )}

              {/* COD NOTE */}
              {selectedMethod === "cod" && (
                <div style={{ marginTop: "15px", padding: "15px", background: "#fff3cd", borderRadius: "10px", fontSize: "14px" }}>
                  <strong>Note:</strong> Please keep exact change ready at the time of delivery.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT - ORDER SUMMARY + COUPON */}
        <div className="col-lg-5">
          {/* COUPON */}
          <div className="card shadow-sm mb-3">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">
                <Icon icon="mdi:tag-outline" width="20" className="me-1" />
                Apply Coupon
              </h6>
              {appliedCoupon ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 15px", background: "#f0fdf4", border: "1px solid #198754", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#198754", fontSize: "14px" }}>
                      {couponCode.toUpperCase()} Applied!
                    </span>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      You save ₹{discount.toFixed(0)}
                    </div>
                  </div>
                  <button onClick={removeCoupon} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{ textTransform: "uppercase" }}
                    />
                    <button onClick={applyCoupon} className="btn btn-outline-success" style={{ whiteSpace: "nowrap" }}>
                      Apply
                    </button>
                  </div>
                  {couponError && <small className="text-danger mt-1 d-block">{couponError}</small>}
                </div>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Order Summary</h6>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>Qty: {item.count}</div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>
                    {item.original_price && item.original_price !== item.price ? (
                      <span>
                        <span style={{ textDecoration: "line-through", color: "#999", marginRight: "4px", fontSize: "12px" }}>
                          ₹{(item.original_price * item.count).toFixed(0)}
                        </span>
                        <span style={{ color: "#ff4444" }}>₹{(item.price * item.count).toFixed(0)}</span>
                      </span>
                    ) : (
                      `₹${(item.price * item.count).toFixed(0)}`
                    )}
                  </div>
                </div>
              ))}

              <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "12px", marginTop: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>Shipping</span>
                  <span style={{ color: shipping === 0 ? "#198754" : "inherit" }}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#198754" }}>
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e0e0e0", paddingTop: "10px", marginTop: "5px" }}>
                  <strong style={{ fontSize: "16px" }}>Total</strong>
                  <strong style={{ fontSize: "18px", color: "#198754" }}>₹{total.toFixed(0)}</strong>
                </div>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                style={{ padding: "12px", fontSize: "16px", fontWeight: "700" }}
                onClick={placeOrder}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{total.toFixed(0)}</>
                )}
              </button>

              {selectedMethod && (
                <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "#888" }}>
                  <Icon icon={getPaymentIcon(selectedMethod)} width="16" className="me-1" />
                  Paying via {getPaymentLabel(selectedMethod)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
