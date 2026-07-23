import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/AdminOrders.css";
import { useNavigate } from "react-router-dom";

const RETURN_REASONS = {
  wrong_item: "Wrong item received",
  damaged: "Item arrived damaged or defective",
  not_as_described: "Item not as described on website",
  size_issue: "Size or fit issue",
  better_price: "Found a better price elsewhere",
  changed_mind: "Changed my mind",
  quality: "Quality not as expected",
  late_delivery: "Late delivery",
  partial_order: "Partial order received",
  other: "Other",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          fetchOrders();
          const newOrder = payload.new;
          setNewOrderNotification({
            id: newOrder.id,
            amount: newOrder.total_amount,
            time: new Date().toLocaleTimeString(),
          });
          setTimeout(() => setNewOrderNotification(null), 5000);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.log(ordersError);
      return;
    }

    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: orderItems } = await supabase.from("order_items").select("*");

    const addressIds = ordersData
      .map((o) => o.address_id)
      .filter(Boolean);

    const { data: addresses } = addressIds.length > 0
      ? await supabase.from("addresses").select("*").in("id", addressIds)
      : { data: [] };

    const mergedOrders = ordersData.map((order) => {
      const customer = profiles?.find((p) => p.id === order.user_id);
      const products = orderItems?.filter(
        (item) => String(item.order_id) === String(order.id)
      ) || [];
      const deliveryAddress = addresses?.find((a) => a.id === order.address_id) || null;
      return { ...order, customer, products, deliveryAddress };
    });

    setOrders(mergedOrders);
  };

  const updateStatus = async (orderId, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.log("Update Error:", error);
      return;
    }

    // Send status update email notification
    try {
      const order = orders.find((o) => o.id === orderId);
      if (order?.customer?.email) {
        await fetch(`${process.env.REACT_APP_BASE_URL}/api/email/status-update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: order.customer.email,
            orderId: orderId,
            status: status,
            total: order.total_amount,
          }),
        });
      }
    } catch (emailErr) {
      console.error("Email notification error:", emailErr);
    }

    fetchOrders();
  };

  const approveReturn = async (orderId) => {
    const confirm = window.confirm("Approve this return request? Refund will be processed.");
    if (!confirm) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "Returned" })
      .eq("id", orderId);

    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    alert("Return approved. Refund will be processed.");
    fetchOrders();
  };

  const rejectReturn = async (orderId) => {
    const confirm = window.confirm("Reject this return request? The order will remain delivered.");
    if (!confirm) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "Return Rejected" })
      .eq("id", orderId);

    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    alert("Return request rejected.");
    fetchOrders();
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setSelectedProduct(null);
    setProductDetails(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setSelectedProduct(null);
    setProductDetails(null);
  };

  const handleProductClick = async (item) => {
    if (selectedProduct?.id === item.id) {
      setSelectedProduct(null);
      setProductDetails(null);
      return;
    }

    setSelectedProduct(item);
    setLoadingProduct(true);
    setProductDetails(null);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", item.product_id)
      .single();

    if (!error && data) {
      setProductDetails(data);
    }
    setLoadingProduct(false);
  };

  const returnRequestedCount = orders.filter((o) => o.status === "Return Requested").length;

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const getStatCounts = () => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    returned: orders.filter((o) => o.status === "Return Requested").length,
    cancelled: orders.filter((o) => o.status === "Cancelled").length,
  });

  const stats = getStatCounts();

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "ao-status-pending";
      case "Packed": return "ao-status-packed";
      case "Shipped": return "ao-status-shipped";
      case "Out For Delivery": return "ao-status-shipped";
      case "Delivered": return "ao-status-delivered";
      case "Cancelled": return "ao-status-cancelled";
      case "Return Requested": return "ao-status-pending";
      case "Return Rejected": return "ao-status-cancelled";
      case "Returned": return "ao-status-delivered";
      default: return "ao-status-pending";
    }
  };

  const filterTabs = [
    "All",
    "Pending",
    "Shipped",
    "Delivered",
    "Return Requested",
    "Returned",
    "Cancelled",
  ];

  return (
    <div className="ao-wrapper">
      {newOrderNotification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            background: "linear-gradient(135deg, #28a745, #20c997)",
            color: "#fff",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(40, 167, 69, 0.4)",
            animation: "slideInRight 0.4s ease-out",
            maxWidth: "360px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🔔</span>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px" }}>New Order Received!</div>
              <div style={{ fontSize: "13px", opacity: 0.9 }}>Order #{newOrderNotification.id.slice(0, 8)}</div>
              <div style={{ fontSize: "13px", opacity: 0.9 }}>Amount: ₹{newOrderNotification.amount}</div>
              <div style={{ fontSize: "11px", opacity: 0.7 }}>{newOrderNotification.time}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <h2 className="ao-title">All Orders</h2>

      {/* Stats */}
      <div className="ao-stats">
        <div className="ao-stat-card ao-stat-total">
          <span className="ao-stat-number">{stats.total}</span>
          <span className="ao-stat-label">Total</span>
        </div>
        <div className="ao-stat-card ao-stat-pending">
          <span className="ao-stat-number">{stats.pending}</span>
          <span className="ao-stat-label">Pending</span>
        </div>
        <div className="ao-stat-card ao-stat-shipped">
          <span className="ao-stat-number">{stats.shipped}</span>
          <span className="ao-stat-label">Shipped</span>
        </div>
        <div className="ao-stat-card ao-stat-delivered">
          <span className="ao-stat-number">{stats.delivered}</span>
          <span className="ao-stat-label">Delivered</span>
        </div>
        <div className="ao-stat-card" style={{ background: "#fff3cd", border: "2px solid #ffc107" }}>
          <span className="ao-stat-number" style={{ color: "#856404" }}>{stats.returned}</span>
          <span className="ao-stat-label" style={{ color: "#856404" }}>Returns</span>
        </div>
        <div className="ao-stat-card ao-stat-cancelled">
          <span className="ao-stat-number">{stats.cancelled}</span>
          <span className="ao-stat-label">Cancelled</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {filterTabs.map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm ${
              statusFilter === tab ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
            {tab === "Return Requested" && (
              <span className="badge bg-warning text-dark ms-1">{returnRequestedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="ao-orders-list">
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            No orders found for this filter
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className={`ao-order-card ${getStatusClass(order.status)}`}
              style={{ animationDelay: `${index * 0.07}s` }}
              onClick={() => openOrderModal(order)}
            >
              <div className="ao-order-header">
                <div className="ao-order-id">
                  <span className="ao-order-id-hash">#</span>
                  {order.id.slice(0, 8)}
                </div>
                <span className={`ao-badge ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="ao-order-body">
                <div className="ao-order-info">
                  <div className="ao-info-row">
                    <span className="ao-info-label">Customer</span>
                    <span className="ao-info-value">{order.customer?.name || "N/A"}</span>
                  </div>
                  <div className="ao-info-row">
                    <span className="ao-info-label">Phone</span>
                    <span className="ao-info-value">{order.customer?.phone || "N/A"}</span>
                  </div>
                  <div className="ao-info-row">
                    <span className="ao-info-label">Total</span>
                    <span className="ao-info-value ao-price">₹{order.total_amount}</span>
                  </div>
                  <div className="ao-info-row">
                    <span className="ao-info-label">Items</span>
                    <span className="ao-info-value">
                      {order.products.length} product{order.products.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {order.deliveryAddress && (
                    <div className="ao-info-row">
                      <span className="ao-info-label">Delivery</span>
                      <span className="ao-info-value" style={{ fontSize: "12px" }}>
                        {order.deliveryAddress.city}, {order.deliveryAddress.state}
                      </span>
                    </div>
                  )}

                  {/* Show return reason if Return Requested */}
                  {order.status === "Return Requested" && order.return_reason && (
                    <div style={{
                      marginTop: "10px", padding: "10px", background: "#fff3cd",
                      borderRadius: "8px", fontSize: "12px",
                    }}>
                      <strong style={{ color: "#856404" }}>Return Reason:</strong>{" "}
                      <span style={{ color: "#856404" }}>
                        {RETURN_REASONS[order.return_reason] || order.return_reason}
                      </span>
                      {order.return_description && (
                        <p className="mb-0 mt-1" style={{ color: "#666", fontSize: "12px" }}>
                          {order.return_description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Area */}
              <div
                className="ao-order-footer"
                onClick={(e) => e.stopPropagation()}
              >
                {order.status === "Return Requested" ? (
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <button
                      className="btn btn-success btn-sm flex-grow-1"
                      onClick={() => approveReturn(order.id)}
                    >
                      ✓ Approve Return
                    </button>
                    <button
                      className="btn btn-danger btn-sm flex-grow-1"
                      onClick={() => rejectReturn(order.id)}
                    >
                      ✕ Reject Return
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="ao-status-label">Update Status</span>
                    <select
                      className={`ao-status-select ${getStatusClass(order.status)}`}
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="ao-modal-overlay" onClick={closeModal}>
          <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ao-modal-header">
              <div>
                <h3 className="ao-modal-title">
                  Order <span className="ao-modal-hash">#</span>{selectedOrder.id.slice(0, 8)}
                </h3>
                <div className="ao-modal-subtitle">
                  <p><strong>Customer:</strong> {selectedOrder.customer?.name || "N/A"}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer?.phone || "N/A"}</p>
                  <p><strong>Total:</strong> ₹{selectedOrder.total_amount}</p>
                  <p><strong>Status:</strong>{" "}
                    <span className={`badge ${getStatusClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  {selectedOrder.deliveryAddress && (
                    <div style={{ marginTop: "10px", padding: "12px", background: "#e8f5e9", borderRadius: "8px", fontSize: "13px" }}>
                      <strong style={{ color: "#2e7d32" }}>Delivery Address:</strong>
                      <p className="mb-1 mt-1"><strong>{selectedOrder.deliveryAddress.full_name}</strong> ({selectedOrder.deliveryAddress.address_type})</p>
                      <p className="mb-1">{selectedOrder.deliveryAddress.phone}</p>
                      <p className="mb-1">{selectedOrder.deliveryAddress.address_line1}</p>
                      {selectedOrder.deliveryAddress.address_line2 && <p className="mb-1">{selectedOrder.deliveryAddress.address_line2}</p>}
                      <p className="mb-1">{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}</p>
                      <p className="mb-0">{selectedOrder.deliveryAddress.country}</p>
                    </div>
                  )}
                  {!selectedOrder.deliveryAddress && selectedOrder.address_id && (
                    <div style={{ marginTop: "10px", padding: "12px", background: "#fff3cd", borderRadius: "8px", fontSize: "13px", color: "#856404" }}>
                      <strong>Address ID:</strong> {selectedOrder.address_id}
                    </div>
                  )}
                  {selectedOrder.return_reason && (
                    <p><strong>Return Reason:</strong>{" "}
                      {RETURN_REASONS[selectedOrder.return_reason] || selectedOrder.return_reason}
                    </p>
                  )}
                  {selectedOrder.return_description && (
                    <p><strong>Return Details:</strong> {selectedOrder.return_description}</p>
                  )}
                </div>
              </div>
              <button className="ao-modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* Return Action Buttons in Modal */}
            {selectedOrder.status === "Return Requested" && (
              <div style={{ padding: "15px 20px", background: "#fff3cd", display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-success btn-sm flex-grow-1"
                  onClick={() => { approveReturn(selectedOrder.id); closeModal(); }}
                >
                  ✓ Approve Return & Process Refund
                </button>
                <button
                  className="btn btn-danger btn-sm flex-grow-1"
                  onClick={() => { rejectReturn(selectedOrder.id); closeModal(); }}
                >
                  ✕ Reject Return
                </button>
              </div>
            )}

            <div className="ao-modal-body">
              <h4 className="ao-modal-section-title">Products in this Order</h4>

              {selectedOrder.products.length === 0 ? (
                <p className="ao-no-products">No products found for this order</p>
              ) : (
                <div className="ao-product-list">
                  {selectedOrder.products.map((item) => (
                    <div
                      key={item.id}
                      className={`ao-product-card ${selectedProduct?.id === item.id ? "ao-product-active" : ""}`}
                      onClick={() => handleProductClick(item)}
                    >
                      <div className="ao-product-row">
                        <img
                          src={item.image}
                          alt={item.product_title}
                          className="ao-product-thumb"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/product/${item.product_id}`)}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                        <div className="ao-product-info">
                          <h5 className="ao-product-name">{item.product_title}</h5>
                          <div className="ao-product-meta">
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ₹{item.price}</span>
                            <span>Total: ₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                        <span className="ao-product-arrow">
                          {selectedProduct?.id === item.id ? "−" : "+"}
                        </span>
                      </div>

                      {selectedProduct?.id === item.id && (
                        <div className="ao-product-details">
                          {loadingProduct ? (
                            <div className="ao-product-loading">
                              <div className="ao-spinner"></div>
                              Loading details...
                            </div>
                          ) : productDetails ? (
                            <div className="ao-detail-grid">
                              <div className="ao-detail-image-wrap">
                                <img
                                  src={productDetails.image}
                                  alt={productDetails.title}
                                  className="ao-detail-image"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/250?text=No+Image";
                                  }}
                                />
                              </div>
                              <div className="ao-detail-info">
                                <h3 className="ao-detail-title">{productDetails.title}</h3>
                                <div className="ao-detail-row">
                                  <span className="ao-detail-label">Category</span>
                                  <span className="ao-detail-value ao-detail-category">
                                    {productDetails.category || "N/A"}
                                  </span>
                                </div>
                                <div className="ao-detail-row">
                                  <span className="ao-detail-label">Price</span>
                                  <span className="ao-detail-value ao-detail-price">
                                    ₹{productDetails.price}
                                  </span>
                                </div>
                                <div className="ao-detail-row">
                                  <span className="ao-detail-label">Stock</span>
                                  <span className="ao-detail-value">{productDetails.stock ?? "N/A"}</span>
                                </div>
                                <div className="ao-detail-row">
                                  <span className="ao-detail-label">Ordered Qty</span>
                                  <span className="ao-detail-value">{item.quantity}</span>
                                </div>
                                <div className="ao-detail-row">
                                  <span className="ao-detail-label">Subtotal</span>
                                  <span className="ao-detail-value ao-detail-price">
                                    ₹{productDetails.price * item.quantity}
                                  </span>
                                </div>
                                <div className="ao-detail-desc-wrap">
                                  <span className="ao-detail-label">Description</span>
                                  <p className="ao-detail-desc">
                                    {productDetails.description || "No description available."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="ao-no-details">Could not load product details.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
