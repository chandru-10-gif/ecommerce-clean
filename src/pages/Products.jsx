import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSingleProduct } from "../services/ProductService";
import BackButton from "../container/BackButton";

export default function Product() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const data = await getSingleProduct(id);
    setProduct(data);
  };

  if (!product) {
    return (
      <div className="text-center mt-5">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <BackButton />

      <div className="row align-items-center">

        <div className="col-12 col-md-6 text-center">
          <img
            src={product.image}
            alt={product.title}
            className="img-fluid"
            style={{
              maxHeight: "350px",
              objectFit: "contain",
            }}
          />
        </div>

        <div className="col-12 col-md-6 mt-4 mt-md-0">

          <h2>{product.title}</h2>

          <h3 className="text-success">
            ₹ {product.price}
          </h3>

          <p>
            <strong>Category:</strong> {product.category}
          </p>

          <button className="btn btn-success me-2">
            Add To Cart
          </button>

          <button className="btn btn-outline-danger">
            Wishlist
          </button>

        </div>

      </div>
    </div>
  );
}