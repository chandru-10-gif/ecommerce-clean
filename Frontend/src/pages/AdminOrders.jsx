import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

 useEffect(() => {

  fetchOrders();

  const channel = supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      () => {
        fetchOrders();
      }
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

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*");

    if (profileError) console.log(profileError);

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*");

    if (itemsError) {
      console.log(itemsError);
      return;
    }

    const mergedOrders = ordersData.map((order) => {
      const customer = profiles?.find((profile) => profile.id === order.user_id);
      const products = orderItems?.filter(
        (item) => String(item.order_id) === String(order.id)
      ) || [];
      return { ...order, customer, products };
    });

    setOrders(mergedOrders);
  };

 const updateStatus = async (orderId, status) => {

  console.log("Order ID:", orderId);
  console.log("New Status:", status);

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select();


  console.log("Updated Data:", data);


  if (error) {
    console.log("Update Error:", error);
    return;
  }

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
  const cancelledCount = orders.filter(
  (o) => o.status === "Cancelled"
).length;

  const getStatusClass = (status) => {
  switch (status) {

    case "Pending":
      return "ao-status-pending";

    case "Packed":
      return "ao-status-packed";

    case "Shipped":
      return "ao-status-shipped";

case "Out For Delivery":
  return "ao-status-shipped";

    case "Delivered":
      return "ao-status-delivered";

    case "Cancelled":
      return "ao-status-cancelled";

    default:
      return "ao-status-pending";
  }
};
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div className="ao-wrapper">
      <h2 className="ao-title">All Orders</h2>

      <div className="ao-stats">
        <div className="ao-stat-card ao-stat-total">
          <span className="ao-stat-number">{orders.length}</span>
          <span className="ao-stat-label">Total Orders</span>
        </div>
        <div className="ao-stat-card ao-stat-pending">
          <span className="ao-stat-number">{pendingCount}</span>
          <span className="ao-stat-label">Pending</span>
        </div>
        <div className="ao-stat-card ao-stat-shipped">
          <span className="ao-stat-number">{shippedCount}</span>
          <span className="ao-stat-label">Shipped</span>
        </div>
        <div className="ao-stat-card ao-stat-delivered">
          <span className="ao-stat-number">{deliveredCount}</span>
          <span className="ao-stat-label">Delivered</span>
        </div>
        <div className="ao-stat-card ao-stat-cancelled">
  <span className="ao-stat-number">
    {cancelledCount}
  </span>
  <span className="ao-stat-label">
    Cancelled
  </span>
</div>
      </div>

      <div className="ao-orders-list">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className={`ao-order-card ${getStatusClass(order.status)}`}
            style={{ animationDelay: `${index * 0.07}s` }}
            onClick={() => openOrderModal(order)}
          >
            <div className="ao-order-header">
              <div className="ao-order-id">
                <span className="ao-order-id-hash">#</span>
                {order.id}
              </div>
              <span className={`ao-badge ${getStatusClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="ao-order-body">
             <div className="ao-order-info">

  <div className="ao-info-row">
    <span className="ao-info-label">Customer ID</span>
    <span className="ao-info-value">
      {order.customer?.user_code || "N/A"}
    </span>
  </div>

  <div className="ao-info-row">
    <span className="ao-info-label">Name</span>
    <span className="ao-info-value">
      {order.customer?.name || "N/A"}
    </span>
  </div>

  <div className="ao-info-row">
    <span className="ao-info-label">Phone</span>
    <span className="ao-info-value">
      {order.customer?.phone || "N/A"}
    </span>
  </div>

  <div className="ao-info-row">
    <span className="ao-info-label">Address</span>
    <span className="ao-info-value">
      {order.customer?.address || "N/A"}
    </span>
  </div>

  <div className="ao-info-row">
    <span className="ao-info-label">Total</span>
    <span className="ao-info-value ao-price">
      ₹{order.total_amount}
    </span>
  </div>

  <div className="ao-info-row">
    <span className="ao-info-label">Items</span>
    <span className="ao-info-value">
      {order.products.length} product
      {order.products.length !== 1 ? "s" : ""}
    </span>
  </div>

</div>
            </div>

            <div
              className="ao-order-footer"
              onClick={(e) => e.stopPropagation()}
            >
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

            </div>
          </div>
        ))}
      </div>

      {showModal && selectedOrder && (
        <div className="ao-modal-overlay" onClick={closeModal}>
          <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ao-modal-header">
              <div>
                <h3 className="ao-modal-title">
                  Order <span className="ao-modal-hash">#</span>{selectedOrder.id}
                </h3>
              <div className="ao-modal-subtitle">

<p>
<strong>Customer ID :</strong>{" "}
{selectedOrder.customer?.user_code || "N/A"}
</p>

<p>
<strong>Name :</strong>{" "}
{selectedOrder.customer?.name || "N/A"}
</p>

<p>
<strong>Phone :</strong>{" "}
{selectedOrder.customer?.phone || "N/A"}
</p>

<p>
<strong>Address :</strong>{" "}
{selectedOrder.customer?.address || "N/A"}
</p>

<p>
<strong>Total :</strong>{" "}
₹{selectedOrder.total_amount}
</p>

</div>
              </div>
              <button className="ao-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

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
                                  <span className="ao-detail-value">
                                    {productDetails.stock ?? "N/A"}
                                  </span>
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
                            <p className="ao-no-details">
                              Could not load product details.
                            </p>
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
