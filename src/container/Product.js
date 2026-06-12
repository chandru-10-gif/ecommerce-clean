import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../redux/reducer/Cart";
import { getSingleProduct } from "../services/ProductService";
import BackButton from "./BackButton";

export default function Product() {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(false);

  const list = useSelector((state) => state.cart.list);

  // ✅ FETCH PRODUCT (ONLY ONE useEffect)
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        const data = await getSingleProduct(id);

        console.log("PRODUCT DATA:", data); // ✅ DEBUG HERE

        setItem(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const element = item
    ? list.find((el) => el.id === item.id)
    : null;

  const addToCart = () => {
    if (!item) return;

    if (!element) {
      dispatch(addItem({ ...item, count: 1 }));

      setAlert(true);

      setTimeout(() => {
        setAlert(false);
      }, 3000);
    }
  };

  const buyNow = () => {
    if (!item) return;

    if (!element) {
      dispatch(addItem({ ...item, count: 1 }));
    }

    navigate("/checkout");
  };

  // 🔄 LOADING SCREEN
  if (loading) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="position-absolute top-0 start-0 m-3">
          <BackButton />
        </div>

        <div className="text-center">
          <div className="spinner-border"></div>
          <h4 className="mt-3">Loading Product...</h4>
        </div>
      </div>
    );
  }

  // ❌ NOT FOUND
  if (!item) {
    return (
      <div className="container">
        <div className="mt-3">
          <BackButton />
        </div>

        <h3 className="text-center mt-5">Product Not Found</h3>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1000,
        }}
      >
        <BackButton />
      </div>

      {/* ALERT */}
      {alert && (
        <div
          className="alert alert-success position-fixed top-0 end-0 m-4 shadow"
          style={{ width: "250px", zIndex: 1000 }}
        >
          ✅ Item Added To Cart
        </div>
      )}

      <div className="d-flex justify-content-center">
        <div className="card m-5 p-3" style={{ width: "350px" }}>
          
          {/* ✅ IMAGE FIXED */}
          <img
            src={item.image}
            alt={item.title}
            height={250}
            className="card-img-top"
            style={{ objectFit: "contain" }}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/250?text=No+Image";
            }}
          />

          <div className="card-body text-center">
            <h5 className="card-title">{item.title}</h5>

            <h6 className="mt-3">Price : ₹ {item.price}</h6>

            <h6 className="mt-2">Category : {item.category}</h6>

            <h6 className="mt-2">
              Rating : {item.rating?.rate || 4.5}
            </h6>

            <div className="mt-4">
              <button
                className="btn btn-success me-2"
                onClick={buyNow}
              >
                Buy Now
              </button>

              {element?.count > 0 ? (
                <button
                  className="btn btn-outline-warning ms-2"
                  onClick={() => navigate("/cart")}
                >
                  Go To Cart
                </button>
              ) : (
                <button
                  className="btn btn-success ms-2"
                  onClick={addToCart}
                >
                  Add To Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}