import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../container/BackButton";
import { supabase } from "../services/supabase";
import TrackingTimeline from "../pages/TrackingTimeline";
import { Icon } from "@iconify/react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(orderData);

      const { data: itemData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);
      setItems(itemData || []);

      if (orderData.address_id) {
        const { data: addressData } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", orderData.address_id)
          .single();
        setAddress(addressData);
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  const cancelOrder = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "Cancelled" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Order Cancelled Successfully");
    fetchOrder();
  };

  const requestReturn = async () => {
    if (!returnReason) {
      alert("Please select a reason");
      return;
    }

    setSubmittingReturn(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "Return Requested",
          return_reason: returnReason,
          return_description: returnDescription,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Return request sent to admin. You will be notified once it's reviewed.");
      setShowReturnModal(false);
      setReturnReason("");
      setReturnDescription("");
      fetchOrder();
    } catch (err) {
      console.log(err);
      alert(err.message || "Failed to submit return request");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return "bg-warning text-dark";
      case "Processing": return "bg-primary";
      case "Shipped": return "bg-info";
      case "Out For Delivery": return "bg-info";
      case "Delivered": return "bg-success";
      case "Cancelled": return "bg-danger";
      case "Return Requested": return "bg-warning text-dark";
      case "Return Rejected": return "bg-danger";
      case "Returned": return "bg-success";
      default: return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading...</h4>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mt-5 text-center">
        <BackButton />
        <h4 className="mt-3">Order not found</h4>
      </div>
    );
  }

  return (
    <>
      <div className="container py-4">
        <BackButton />

        <h2 className="mb-4 fw-bold">Order Details</h2>

        {/* Order Information */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="fw-bold mb-0">Order Information</h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-2 col-6 mb-3">
                <small className="text-muted d-block">Order Number</small>
                <span className="fw-bold">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <small className="text-muted d-block">Order Placed</small>
                <span className="fw-bold">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <small className="text-muted d-block">Delivered On</small>
                <span className="fw-bold">
                  {order.status === "Delivered" || order.status === "Returned"
                    ? new Date(order.updated_at || order.created_at).toLocaleDateString()
                    : "--"}
                </span>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <small className="text-muted d-block">No of Items</small>
                <span className="fw-bold">{items.length}</span>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <small className="text-muted d-block">Status</small>
                <span className={`badge ${getStatusBadge(order.status)} px-3 py-2`}>
                  {order.status}
                </span>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <small className="text-muted d-block">Tracking ID</small>
                <span className="fw-bold">TRK-{order.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Tracking */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0 fw-bold">Order Tracking</h5>
          </div>
          <div className="card-body">
            <TrackingTimeline status={order.status} />
          </div>
        </div>

        {/* Return / Refund Status Banner */}
        {order.status === "Return Requested" && (
          <div className="card shadow-sm mb-4 border-warning">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: "50px", height: "50px", borderRadius: "50%",
                  background: "#fff3cd", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon icon="mdi:clock-outline" width="28" color="#856404" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#856404" }}>
                    Return Request Pending
                  </h6>
                  <p className="mb-0" style={{ fontSize: "13px", color: "#856404" }}>
                    Your return request is being reviewed by our team. We'll update you soon.
                  </p>
                  {order.return_reason && (
                    <p className="mb-0 mt-1" style={{ fontSize: "12px", color: "#666" }}>
                      <strong>Reason:</strong> {order.return_reason}
                      {order.return_description && ` — ${order.return_description}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {order.status === "Return Rejected" && (
          <div className="card shadow-sm mb-4 border-danger">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: "50px", height: "50px", borderRadius: "50%",
                  background: "#f8d7da", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon icon="mdi:close-circle-outline" width="28" color="#dc3545" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#dc3545" }}>
                    Return Request Rejected
                  </h6>
                  <p className="mb-0" style={{ fontSize: "13px", color: "#dc3545" }}>
                    Your return request has been declined. If you have concerns, please contact support.
                  </p>
                  {order.return_reason && (
                    <p className="mb-0 mt-1" style={{ fontSize: "12px", color: "#666" }}>
                      <strong>Your Reason:</strong> {order.return_reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {order.status === "Returned" && (
          <div className="card shadow-sm mb-4 border-success">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: "50px", height: "50px", borderRadius: "50%",
                  background: "#d1e7dd", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon icon="mdi:check-circle-outline" width="28" color="#0f5132" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#0f5132" }}>
                    Return Approved & Refund Processed
                  </h6>
                  <p className="mb-0" style={{ fontSize: "13px", color: "#0f5132" }}>
                    Your return has been approved. Refund of <strong>₹{order.total_amount}</strong> will be credited within 5-7 business days.
                  </p>
                  {order.return_reason && (
                    <p className="mb-0 mt-1" style={{ fontSize: "12px", color: "#666" }}>
                      <strong>Return Reason:</strong> {order.return_reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items from this order */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="fw-bold mb-0">Items from this order</h5>
          </div>
          <div className="card-body">
            {items.length === 0 ? (
              <p>No Products Found</p>
            ) : (
              items.map((product) => (
                <div
                  key={product.id}
                  className="row align-items-center border-bottom py-3"
                >
                  <div className="col-md-2 col-4 text-center">
                    <img
                      src={product.image}
                      alt={product.product_title}
                      className="img-fluid rounded order-detail-img"
                      style={{
                        width: "110px",
                        height: "110px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/product/${product.product_id}`)}
                    />
                  </div>
                  <div className="col-md-7 col-8">
                    <h5 className="fw-bold">{product.product_title}</h5>
                    <p className="mb-1">Quantity: {product.quantity}</p>
                    <p className="mb-1">Price: ₹{product.price}</p>
                  </div>
                  <div className="col-md-3 text-md-end mt-3 mt-md-0">
                    <h5 className="text-success fw-bold">
                      ₹{product.price * product.quantity}
                    </h5>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delivery Address */}
        {address && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">Delivery Address</h5>
            </div>
            <div className="card-body">
              <h5 className="fw-bold">{address.full_name}</h5>
              <p className="mb-1">📞 {address.phone}</p>
              <p className="mb-1">{address.address_line1}</p>
              {address.address_line2 && <p className="mb-1">{address.address_line2}</p>}
              <p className="mb-1">{address.city}, {address.state}</p>
              <p className="mb-1">{address.pincode}</p>
              <p className="mb-0">{address.country}</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0 fw-bold">Order Summary</h5>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Order ID</span>
              <span>#{order.id.slice(0, 8)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total Amount</span>
              <span className="text-success fw-bold">₹{order.total_amount}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Payment</span>
              <span>{order.payment_method ? order.payment_method.replace(/_/g, " ").toUpperCase() : "N/A"}</span>
            </div>
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold">Current Status</span>
              <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
            </div>

            {/* Action Buttons */}
            {order.status !== "Cancelled" &&
             order.status !== "Delivered" &&
             order.status !== "Return Requested" &&
             order.status !== "Return Rejected" &&
             order.status !== "Returned" && (
              <button className="btn btn-danger w-100 mb-2" onClick={cancelOrder}>
                Cancel Order
              </button>
            )}

            {order.status === "Delivered" && (
              <button
                className="btn btn-warning w-100"
                onClick={() => setShowReturnModal(true)}
              >
                Request Return / Refund
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RETURN/REFUND MODAL */}
      {showReturnModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setShowReturnModal(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: "16px", padding: "30px",
              maxWidth: "480px", width: "90%", maxHeight: "90vh", overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h5 className="fw-bold mb-0">Return / Refund Request</h5>
              <button onClick={() => setShowReturnModal(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
              Select the reason for your return request. Our team will review it within 24-48 hours.
            </p>

            <div style={{ marginBottom: "15px" }}>
              <label className="form-label fw-bold">Reason for Return *</label>
              {[
                { value: "wrong_item", label: "Wrong item received", icon: "mdi:package-variant" },
                { value: "damaged", label: "Item arrived damaged or defective", icon: "mdi:alert-circle-outline" },
                { value: "not_as_described", label: "Item not as described on website", icon: "mdi:information-outline" },
                { value: "size_issue", label: "Size or fit issue", icon: "mdi:ruler" },
                { value: "better_price", label: "Found a better price elsewhere", icon: "mdi:tag-outline" },
                { value: "changed_mind", label: "Changed my mind", icon: "mdi:refresh" },
                { value: "quality", label: "Quality not as expected", icon: "mdi:star-outline" },
                { value: "late_delivery", label: "Late delivery", icon: "mdi:clock-outline" },
                { value: "partial_order", label: "Partial order received", icon: "mdi:package-variant-closed" },
                { value: "other", label: "Other", icon: "mdi:dots-horizontal" },
              ].map((reason) => (
                <div
                  key={reason.value}
                  onClick={() => setReturnReason(reason.value)}
                  style={{
                    padding: "12px 15px",
                    border: returnReason === reason.value ? "2px solid #198754" : "1px solid #e0e0e0",
                    borderRadius: "10px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    background: returnReason === reason.value ? "#f0fdf4" : "#fff",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    border: returnReason === reason.value ? "2px solid #198754" : "2px solid #ccc",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {returnReason === reason.value && (
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#198754" }} />
                    )}
                  </div>
                  <Icon icon={reason.icon} width="18" color={returnReason === reason.value ? "#198754" : "#666"} />
                  {reason.label}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="form-label fw-bold">Additional Details (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Tell us more about the issue..."
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-outline-secondary flex-grow-1"
                onClick={() => setShowReturnModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning flex-grow-1"
                onClick={requestReturn}
                disabled={submittingReturn || !returnReason}
              >
                {submittingReturn ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
