import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Modal, Button } from "react-bootstrap";

export default function AdminUsers() {
    const [show, setShow] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orders, setOrders] = useState([]);
 const [showOrderModal, setShowOrderModal] = useState(false);

  const getUsers = async () => {
   const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("role", "user")
  .order("created_at", { ascending: false });

    if (!error) {
      setUsers(data);
    }
  };

  const handleView = async (user) => {
    setSelectedUser(user);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("user_id", user.id);

    if (!error) {
      setOrders(data);
    }

    setShow(true);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2>User Management</h2>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>User Code</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>

              <td>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleView(user)
                  }
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            User Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedUser && (
            <>
              <h5>User Information</h5>

              <p>
                <strong>User Code:</strong>{" "}
                {selectedUser.name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedUser.email}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {selectedUser.role}
              </p>

              <hr />

              <h5>Order History</h5>

              {orders.length === 0 ? (
                <p>No Orders Found</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="card mb-3 p-3"
                  >
                    <h6
  style={{
    cursor: "pointer",
    color: "#0d6efd"
  }}
  onClick={() => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }}
>
  Order ID: {order.id}
</h6>

                    <p>
                      Total Amount:
                      ₹
                      {order.total_amount}
                    </p>

                    <p>
                      Status:
                      {order.status}
                    </p>

                    <h6>
                      Products Purchased
                    </h6>

                    <ul>
                      {order.order_items?.map(
                        (item) => (
                          <li
                            key={item.id}
                          >
                            {
                              item.product_title
                            }
                            {" - "}
                            Qty:
                            {
                              item.quantity
                            }
                            {" - ₹"}
                            {item.price}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setShow(false)
            }
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
  show={showOrderModal}
  onHide={() => setShowOrderModal(false)}
  size="lg"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>
      Order Details
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {selectedOrder && (
      <>
        <div className="mb-4">
          <h5>Customer Information</h5>

          <p>
            <strong>User Code:</strong>
            {" "}
            {selectedUser?.name}
          </p>

          <p>
            <strong>Email:</strong>
            {" "}
            {selectedUser?.email}
          </p>

          <p>
            <strong>Role:</strong>
            {" "}
            {selectedUser?.role}
          </p>
        </div>

        <hr />

        <h5>Products</h5>

        {selectedOrder.order_items?.map(
          (item) => (
            <div
              key={item.id}
              className="card p-3 mb-3"
            >
              <div className="row">
                <div className="col-md-3">
                  <img
                    src={item.image}
                    alt={item.product_title}
                    className="img-fluid rounded"
                  />
                </div>

                <div className="col-md-9">
                  <h5>
                    {item.product_title}
                  </h5>

                  <p>
                    Quantity:
                    {item.quantity}
                  </p>

                  <p>
                    Price:
                    ₹{item.price}
                  </p>

                  <p>
                    Total:
                    ₹
                    {item.price *
                      item.quantity}
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        <hr />

        <h4>
          Grand Total:
          ₹
          {selectedOrder.total_amount}
        </h4>

        <h5>
          Status:
          {selectedOrder.status}
        </h5>
      </>
    )}
  </Modal.Body>
</Modal>
    </div>
  );
}