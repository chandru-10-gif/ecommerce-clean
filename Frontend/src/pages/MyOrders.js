import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import BackButton from "../container/BackButton";

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(
          id,
          image,
          product_title,
          quantity,
          price
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setOrders(data || []);
  };

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const badgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Processing":
        return "primary";
      case "Shipped":
        return "info";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container py-4">

      <BackButton />

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          My Orders
        </h2>

        <span className="badge bg-primary fs-6">
          {orders.length} Orders
        </span>

      </div>

      <div className="mb-4 d-flex flex-wrap gap-2">

        {[
          "All",
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ].map((status) => (
          <button
            key={status}
            className={`btn ${
              statusFilter === status
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}

      </div>

      {/* Table Header */}

      <div className="card shadow-sm border-0 rounded-4">

        <div className="card-header bg-light fw-bold">

          <div className="row text-center">

            <div className="col-md-2">Order ID</div>

            <div className="col-md-2">Date</div>

            <div className="col-md-2">Total</div>

            <div className="col-md-2">Status</div>

            <div className="col-md-2">Item Details</div>

            <div className="col-md-2">Actions</div>

          </div>

        </div>

               <div className="card-body p-0">

          {filteredOrders.length === 0 ? (

            <div className="text-center py-5">
              <h5>No Orders Found</h5>
            </div>

          ) : (

            filteredOrders.map((item) => (

              <div
                key={item.id}
                className="row align-items-center text-center py-4 border-bottom mx-0"
              >

                {/* Order ID */}

                <div className="col-md-2">

                  <h6 className="fw-bold mb-1">
                    #{item.id.slice(0,8)}
                  </h6>

                  <small className="text-muted">
                    {item.order_items?.length} Item(s)
                  </small>

                </div>

                {/* Date */}

                <div className="col-md-2">

                  <div>
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>

                </div>

                {/* Price */}

                <div className="col-md-2">

                  <h5 className="text-success fw-bold">
                    ₹{item.total_amount}
                  </h5>

                </div>

                {/* Status */}

                <div className="col-md-2">

                  <span
                    className={`badge bg-${badgeColor(item.status)} px-3 py-2`}
                  >
                    {item.status}
                  </span>

                </div>

                {/* Product */}

                <div className="col-md-2">

                  <div className="d-flex align-items-center">

                    <img
                      src={item.order_items?.[0]?.image}
                      alt=""
                      style={{
                        width:70,
                        height:70,
                        objectFit:"cover",
                        borderRadius:"10px",
                      }}
                    />

                    <div className="ms-3 text-start">

                      <h6 className="mb-1">
                        {item.order_items?.[0]?.product_title}
                      </h6>

                      <small>
                        Qty : {item.order_items?.[0]?.quantity}
                      </small>

                      <br />

                      <small className="text-success">
                        ₹{item.order_items?.[0]?.price}
                      </small>

                    </div>

                  </div>

                </div>

                {/* Actions */}

                <div className="col-md-2">

                  <div className="d-grid gap-2">

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(`/order/${item.id}`)
                      }
                    >
                      View Details
                    </button>

                    

                    {item.status === "Pending" && (

                      <button
                        className="btn btn-danger btn-sm"
                      >
                        Cancel
                      </button>

                    )}

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>

  );

}