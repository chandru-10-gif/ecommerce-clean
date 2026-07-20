import React from "react";
import BackButton from "./BackButton";

export default function Success() {


  return (

    <div
      className="container-fluid d-flex flex-column"
      style={{
        minHeight: "100vh",
      }}
    >

      <div className="mt-3 ms-3">
        <BackButton />
      </div>

      <div
        className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center"
      >

        <h2 className="text-success">
          ✅ Order Placed Successfully
        </h2>

       

      </div>

    </div>

  );
}