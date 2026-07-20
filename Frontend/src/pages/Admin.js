import React from "react";

export default function Admin() {
  return (
    <>
      <h1 className="text-center mb-4">
        Dashboard
      </h1>

      <div className="dashboard-cards">

        <div className="card">
          <h3>Products</h3>
          <p>120</p>
        </div>

        <div className="card">
          <h3>Orders</h3>
          <p>85</p>
        </div>

        <div className="card">
          <h3>Users</h3>
          <p>45</p>
        </div>

        <div className="card">
          <h3>Revenue</h3>
          <p>₹25,000</p>
        </div>

      </div>
    </>
  );
}