import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSingleProduct } from "../services/ProductService";

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
    return <h2>Loading...</h2>;
  }

  return (
    <div className="container mt-5 text-center">

      <img
        src={product.image}
        width="250"
        height="250"
        style={{objectFit:"contain"}}
        alt={product.title}
      />

      <h2>{product.title}</h2>

      <h4>₹ {product.price}</h4>

      <p>{product.category}</p>

    </div>
  );
}