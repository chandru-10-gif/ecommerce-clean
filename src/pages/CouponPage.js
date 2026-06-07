import React, { useState } from "react";
import { coupons } from "../data/coupons";
import { Icon } from "@iconify/react";
import BackButton from "../container/BackButton";

export default function CouponPage() {
  const [selectedCoupon, setSelectedCoupon] = useState("");

  return (
    <div className="container mt-4">
      <BackButton />

      <h2 className="mb-4 d-flex align-items-center">
        <Icon icon="mdi:ticket-confirmation" className="me-2" />
        Coupons
      </h2>

      <div className="row">
        {coupons.map((item) => (
          <div key={item.id} className="col-12 col-md-4 mb-3">
            <div
              className="card p-3 text-center h-100"
              style={{
                border:
                  selectedCoupon === item.code
                    ? "2px solid green"
                    : "1px solid #ddd",
                boxShadow:
                  selectedCoupon === item.code
                    ? "0 0 10px rgba(0,255,0,0.3)"
                    : "none",
                transition: "0.3s",
              }}
            >
              <h4>{item.code}</h4>

              <p>{item.description}</p>

              <h5 className="text-success">
                {item.discount}% OFF
              </h5>

              <button
                className={`btn mt-2 ${
                  selectedCoupon === item.code
                    ? "btn-success"
                    : "btn-primary"
                }`}
                onClick={() => setSelectedCoupon(item.code)}
              >
                {selectedCoupon === item.code
                  ? "Selected"
                  : "Apply Coupon"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}