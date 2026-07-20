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


  return (

    <div className="tracking-wrapper">


      <div className="tracking-line-bg"></div>


      <div
        className="tracking-line-progress"
        style={{
          width:
            currentStep === 0
              ? "0%"
              : `${(currentStep / (steps.length - 1)) * 100}%`,
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
                index <= currentStep
                  ? "tracking-icon active"
                  : "tracking-icon"
              }
            >

              {step.icon}

            </div>



            <p
              className={
                index <= currentStep
                  ? "tracking-text active"
                  : "tracking-text"
              }
            >

              {step.title}

            </p>



          </div>


        ))}


      </div>


    </div>

  );
}