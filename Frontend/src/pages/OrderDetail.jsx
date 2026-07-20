import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../container/BackButton";
import { supabase } from "../services/supabase";
import TrackingTimeline from "../pages/TrackingTimeline";
import { useNavigate} from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      const { data: addressData } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", orderData.address_id)
        .single();

      setAddress(addressData);

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

    const cancelOrder = async () => {

  console.log("Cancel button clicked");

  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this order?"
  );

  if (!confirmCancel) return;


  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "Cancelled",
    })
    .eq("id", id)
    .select();


  console.log("Update Data:", data);
  console.log("Error:", error);


  if (error) {
    alert(error.message);
    return;
  }


  alert("Order Cancelled Successfully");

  fetchOrder();
};

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading...</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <BackButton />

      <h2 className="mb-4 fw-bold">
        Order Details
      </h2>
{/* Order Information */}

<div className="card shadow-sm mb-4">

  <div className="card-header bg-white">
    <h5 className="fw-bold mb-0">
      Order Information
    </h5>
  </div>

  <div className="card-body">

    <div className="row text-center">

      <div className="col-md-2 col-6 mb-3">
        <small className="text-muted d-block">
          Order Number
        </small>

        <span className="fw-bold">
          #{order.id}
        </span>
      </div>

      <div className="col-md-2 col-6 mb-3">
        <small className="text-muted d-block">
          Order Placed
        </small>

        <span className="fw-bold">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="col-md-2 col-6 mb-3">
        <small className="text-muted d-block">
          Order Delivered
        </small>

        <span className="fw-bold">
          {order.status === "Delivered"
            ? new Date(order.updated_at || order.created_at).toLocaleDateString()
            : "--"}
        </span>
      </div>

      <div className="col-md-2 col-6 mb-3">
        <small className="text-muted d-block">
          No of Items
        </small>

        <span className="fw-bold">
          {items.length}
        </span>
      </div>

      <div className="col-md-2 col-6 mb-3">
        <small className="text-muted d-block">
          Status
        </small>

        <span className="badge bg-success">
          {order.status}
        </span>
      </div>

      <div className="col-md-2 col-6 mb-3">
        <small className="text-muted d-block">
          Tracking ID
        </small>

        <span className="fw-bold">
          TRK-{order.id}
        </span>
      </div>

    </div>

  </div>

</div>

{/* Order Tracking */}

<div className="card shadow-sm mb-4">

  <div className="card-header bg-white">
    <h5 className="mb-0 fw-bold">
      Order Tracking
    </h5>
  </div>

  <div className="card-body">
    <TrackingTimeline status={order.status}/>
  </div>

</div>
           

      {/* Items from this order */}

<div className="card shadow-sm mb-4">

  <div className="card-header bg-white">
    <h5 className="fw-bold mb-0">
      Items from this order
    </h5>
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

          {/* Product Image */}
          <div className="col-md-2 col-4 text-center">

           <img
  src={product.image}
  alt={product.product_title}
  className="img-fluid rounded"
  style={{
    width: "110px",
    height: "110px",
    objectFit: "cover",
    cursor: "pointer",
  }}
  onClick={() => navigate(`/product/${product.product_id}`)}
/>

          </div>

          {/* Product Details */}
          <div className="col-md-7 col-8">

            <h5 className="fw-bold">
              {product.product_title}
            </h5>

            <p className="mb-1">
              Quantity : {product.quantity}
            </p>

            <p className="mb-1">
              Price : ₹{product.price}
            </p>

          </div>

          {/* Total */}
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
            <h5 className="mb-0 fw-bold">
              Delivery Address
            </h5>
          </div>

          <div className="card-body">

            <h5 className="fw-bold">
              {address.full_name}
            </h5>

            <p className="mb-1">
              📞 {address.phone}
            </p>

            <p className="mb-1">
              {address.address_line1}
            </p>

            {address.address_line2 && (
              <p className="mb-1">
                {address.address_line2}
              </p>
            )}

            <p className="mb-1">
              {address.city}, {address.state}
            </p>

            <p className="mb-1">
              {address.pincode}
            </p>

            <p className="mb-0">
              {address.country}
            </p>

          </div>

        </div>
      )}

         

      {/* Order Summary */}

      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white">
          <h5 className="mb-0 fw-bold">
            Order Summary
          </h5>
        </div>

        <div className="card-body">

          <div className="d-flex justify-content-between mb-3">
            <span className="fw-bold">
              Order ID
            </span>

            <span>
              {order.id}
            </span>
          </div>


          <div className="d-flex justify-content-between mb-3">
            <span className="fw-bold">
              Total Amount
            </span>

            <span className="text-success fw-bold">
              ₹{order.total_amount}
            </span>
          </div>


          <div className="d-flex justify-content-between mb-4">

            <span className="fw-bold">
              Current Status
            </span>


            <span className="badge bg-warning">
              {order.status}
            </span>

          </div>


          {order.status !== "Cancelled" &&
           order.status !== "Delivered" && (

            <button
              className="btn btn-danger w-100"
              onClick={cancelOrder}
            >
              Cancel Order
            </button>

          )}

        </div>

      </div>


    </div>   // container closing
  );
}