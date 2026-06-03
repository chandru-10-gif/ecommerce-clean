import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

export default function Success() {

  const [count, setCount] = useState(15);

  const navigate = useNavigate();

  useEffect(() => {

    const interval = setInterval(() => {

      setCount((prev) => {

        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;

      });

    }, 1000);

    const timer = setTimeout(() => {

      navigate("/");

    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };

  }, [navigate]);

  return (

    <div className="container">

      <div className="mt-3">
        <BackButton />
      </div>

      <div className="text-center mt-5">

        <h2>
          ✅ Order Placed Successfully
        </h2>

        <p className="mt-3">
          You will be redirected in {count} seconds
        </p>

      </div>

    </div>
  );
}