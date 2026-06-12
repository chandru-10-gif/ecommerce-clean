import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BackButton from "../container/BackButton";
import { Icon } from "@iconify/react";
import ProductSkeleton from "../container/Skeleton";

export default function Wishlist() {
  const [loading, setLoading] = useState(true);

  const wishlistItems = useSelector(
    (state) => state.wishlist.list
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <BackButton />

        <h2 className="mb-4">
          <Icon
            icon="mdi:heart"
            color="red"
            className="me-2"
          />
          My Wishlist
        </h2>

        <div className="row">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="col-6 col-md-4 col-lg-3 mb-3"
            >
              <ProductSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <BackButton />

      <h2 className="mb-4">
        <Icon
          icon="mdi:heart"
          color="red"
          className="me-2"
        />
        My Wishlist
      </h2>

      {wishlistItems.length === 0 ? (
        <h4>No products in wishlist</h4>
      ) : (
        <div className="row">
          {wishlistItems.map((item) => (
            <div
              className="col-6 col-md-4 col-lg-3 mb-3"
              key={item._id}
            >
              <div
                className="card p-3 text-center h-100"
                style={{
                  minHeight: "350px",
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    height: "150px",
                    width: "100%",
                    objectFit: "contain",
                  }}
                />

                <h6
                  className="mt-3"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minHeight: "40px",
                  }}
                >
                  {item.title}
                </h6>

                <h5>₹ {item.price}</h5>

                <p>{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}