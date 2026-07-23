import React from "react";
import {
  FaClipboardCheck,
  FaBoxOpen,
  FaTruck,
  FaShippingFast,
  FaHome,
} from "react-icons/fa";

import "../styles/TrackingTimeline.css";


const steps = [
  {
    title: "Pending",
    icon: <FaClipboardCheck />,
  },
  {
    title: "Packed",
    icon: <FaBoxOpen />,
  },
  {
    title: "Shipped",
    icon: <FaTruck />,
  },
  {
    title: "Out for Delivery",
    icon: <FaShippingFast />,
  },
  {
    title: "Delivered",
    icon: <FaHome />,
  },
];


export default function TrackingTimeline({ status }) {


  const currentStep = steps.findIndex(
    (step) => step.title === status
  );

  const isReturnStatus = ["Return Requested", "Return Rejected", "Returned"].includes(status);
  const effectiveStep = isReturnStatus ? steps.length - 1 : currentStep;

  return (

    <div className="tracking-wrapper">


      <div className="tracking-line-bg"></div>


      <div
        className="tracking-line-progress"
        style={{
          width:
            effectiveStep <= 0
              ? "0%"
              : `${(effectiveStep / (steps.length - 1)) * 100}%`,
        }}
      />


      <div className="tracking-container">


        {steps.map((step,index)=>(


          <div
            className="tracking-item"
            key={step.title}
          >


            <div
              className={
                index <= effectiveStep
                  ? "tracking-icon active"
                  : "tracking-icon"
              }
            >

              {step.icon}

            </div>



            <p
              className={
                index <= effectiveStep
                  ? "tracking-text active"
                  : "tracking-text"
              }
            >

              {step.title}

            </p>



          </div>


        ))}


      </div>

      {isReturnStatus && (
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <span style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
            background: status === "Return Requested" ? "#fff3cd" : status === "Returned" ? "#d1e7dd" : "#f8d7da",
            color: status === "Return Requested" ? "#856404" : status === "Returned" ? "#0f5132" : "#dc3545",
          }}>
            {status === "Return Requested" && "🔄 Return Request Under Review"}
            {status === "Return Rejected" && "✕ Return Request Rejected"}
            {status === "Returned" && "✓ Return Approved — Refund Processed"}
          </span>
        </div>
      )}


    </div>

  );
}