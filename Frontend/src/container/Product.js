import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../redux/reducer/Cart";
import { getSingleProduct, getProducts } from "../services/ProductService";
import BackButton from "./BackButton";
import { supabase } from "../services/supabase";
import { Icon } from "@iconify/react";

export default function Product() {

  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [imgZoomed, setImgZoomed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(false);


  const list = useSelector(
    (state) => state.cart?.list || []
  );


  // =========================
  // FETCH REVIEWS
  // =========================

  const fetchReviews = async () => {

    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", id)
      .order("created_at", {
        ascending:false
      });


    if(error){

      console.log("Review Error:",error);

      return;
    }


    setReviews(data || []);

  };


  // =========================
  // FETCH RELATED PRODUCTS
  // =========================

  const fetchRelatedProducts = async (category) => {
    try {
      const data = await getProducts(1, 500, "");
      const products = data.products || [];
      const related = products
        .filter((p) => p.category === category && p.id !== id)
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.log("Related Products Error:", error);
    }
  };


  // =========================
  // STAR RATING DISPLAY
  // =========================

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) - fullStars >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Icon
            key={i}
            icon="mdi:star"
            width="18"
            height="18"
            color="#ffc107"
            style={{ marginRight: "2px" }}
          />
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <Icon
            key={i}
            icon="mdi:star-half-full"
            width="18"
            height="18"
            color="#ffc107"
            style={{ marginRight: "2px" }}
          />
        );
      } else {
        stars.push(
          <Icon
            key={i}
            icon="mdi:star-outline"
            width="18"
            height="18"
            color="#ffc107"
            style={{ marginRight: "2px" }}
          />
        );
      }
    }

    return stars;
  };


  // =========================
  // STOCK STATUS
  // =========================

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <span className="badge bg-danger px-3 py-2" style={{ fontSize: "13px" }}>
          Out of Stock
        </span>
      );
    } else if (stock <= 10) {
      return (
        <span className="badge bg-warning text-dark px-3 py-2" style={{ fontSize: "13px" }}>
          Low Stock ({stock} left)
        </span>
      );
    } else {
      return (
        <span className="badge bg-success px-3 py-2" style={{ fontSize: "13px" }}>
          In Stock ({stock} available)
        </span>
      );
    }
  };


  // =========================
  // LOAD PRODUCT
  // =========================

  useEffect(()=>{


    const loadProduct = async()=>{

      try{

        setLoading(true);


        const data = await getSingleProduct(id);


        setItem(data);

        if (data && data.category) {
          fetchRelatedProducts(data.category);
        }

      }
      catch(error){

        console.log(error);

      }
      finally{

        setLoading(false);

      }

    };


    loadProduct();

    fetchReviews();

    setQuantity(1);


  },[id]);




  const element = item
    ? list.find(
        (el)=>el.id === item.id
      )
    : null;



  // =========================
  // ADD CART
  // =========================

  const addToCart = ()=>{

    if(!item) return;


    for (let i = 0; i < quantity; i++) {

      if(!element){

        const hasOffer = (String(item.is_offer).toLowerCase() === "true" || item.is_offer === true || item.is_offer === 1) && item.offer_price && Number(item.offer_price) > 0;

        dispatch(
          addItem({
            ...item,
            price: hasOffer ? Number(item.offer_price) : item.price,
            original_price: item.price,
            is_offer: item.is_offer,
            offer_price: item.offer_price,
            count:1
          })
        );

      }

    }


    setAlert(true);


    setTimeout(()=>{

      setAlert(false);

    },3000);

  };




  // =========================
  // BUY NOW
  // =========================

  const buyNow = ()=>{

    if(!item) return;


    if(!element){

      const hasOffer = (String(item.is_offer).toLowerCase() === "true" || item.is_offer === true || item.is_offer === 1) && item.offer_price && Number(item.offer_price) > 0;

      dispatch(
        addItem({
          ...item,
          price: hasOffer ? Number(item.offer_price) : item.price,
          original_price: item.price,
          is_offer: item.is_offer,
          offer_price: item.offer_price,
          count:1
        })
      );

    }


    const hasOffer = (String(item.is_offer).toLowerCase() === "true" || item.is_offer === true || item.is_offer === 1) && item.offer_price && Number(item.offer_price) > 0;

    navigate(
      "/checkout",
      {
        state:{
          items:[
            {
              ...item,
              price: hasOffer ? Number(item.offer_price) : item.price,
              original_price: item.price,
              is_offer: item.is_offer,
              offer_price: item.offer_price,
              count: quantity
            }
          ]
        }
      }
    );


  };





  // =========================
  // LOADING
  // =========================

  if(loading){

    return(

      <div className="vh-100 d-flex justify-content-center align-items-center">

        <div>

          <div className="spinner-border"></div>

          <h5>
            Loading Product...
          </h5>

        </div>

      </div>

    );

  }




  if(!item){

    return(

      <div className="container">

        <BackButton />

        <h3 className="text-center mt-5">
          Product Not Found
        </h3>

      </div>

    );

  }




  return (

    <div className="container pb-5">


      {/* BACK BUTTON */}

      <div className="mt-3">

        <BackButton />

      </div>



      {/* BREADCRUMB */}

      <nav aria-label="breadcrumb" className="mt-3">

        <ol className="breadcrumb" style={{ background: "transparent", padding: 0, margin: 0 }}>

          <li className="breadcrumb-item">
            <span
              style={{ cursor: "pointer", color: "#198754", textDecoration: "none" }}
              onClick={() => navigate("/")}
            >
              Home
            </span>
          </li>

          <li className="breadcrumb-item">
            <span
              style={{ cursor: "pointer", color: "#198754", textDecoration: "none" }}
              onClick={() => navigate(`/?category=${item.category}`)}
            >
              {item.category}
            </span>
          </li>

          <li className="breadcrumb-item active" aria-current="page" style={{ color: "#555" }}>
            {item.title}
          </li>

        </ol>

      </nav>



      {/* ALERT */}

      {
        alert && (

          <div
            className="alert alert-success position-fixed top-0 end-0 m-3"
            style={{
              zIndex:9999
            }}
          >

            ✅ Item Added To Cart

          </div>

        )
      }




      {/* TWO COLUMN LAYOUT */}

      <div className="row mt-3">



        {/* LEFT - IMAGE */}

        <div className="col-lg-6 col-md-6 col-12 mb-4">

          <div
            className="card border-0 shadow-sm overflow-hidden"
            style={{
              borderRadius: "16px",
              cursor: "zoom-in",
            }}
            onMouseEnter={() => setImgZoomed(true)}
            onMouseLeave={() => setImgZoomed(false)}
          >

            <img

              src={item.image}

              alt={item.title}

              style={{
                width: "100%",
                height: "450px",
                objectFit: "contain",
                padding: "20px",
                transition: "transform 0.4s ease",
                transform: imgZoomed ? "scale(1.15)" : "scale(1)",
              }}

            />

          </div>

        </div>



        {/* RIGHT - DETAILS */}

        <div className="col-lg-6 col-md-6 col-12">



          <h3 style={{ fontWeight: "700", color: "#222" }}>
            {item.title}
          </h3>



          {/* RATING */}

          <div className="d-flex align-items-center mt-2 mb-3">

            {renderStars(item.rating?.rate || 4.5)}

            <span style={{ marginLeft: "8px", color: "#888", fontSize: "14px" }}>
              {item.rating?.rate || 4.5} / 5
            </span>

            <span style={{ marginLeft: "12px", color: "#aaa", fontSize: "13px" }}>
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>

          </div>



          {/* PRICE */}

          <div className="mb-3">

            {item.is_offer && item.offer_price && Number(item.offer_price) > 0 ? (
              <div className="d-flex align-items-center gap-3">
                <span style={{
                  textDecoration: "line-through",
                  color: "#999",
                  fontSize: "18px"
                }}>
                  ₹ {item.price}
                </span>
                <span style={{
                  color: "#ff4444",
                  fontWeight: "700",
                  fontSize: "28px"
                }}>
                  ₹ {item.offer_price}
                </span>
                <span className="badge bg-danger" style={{ fontSize: "12px" }}>
                  {Math.round(((item.price - item.offer_price) / item.price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <span style={{
                fontWeight: "700",
                fontSize: "28px",
                color: "#222"
              }}>
                ₹ {item.price}
              </span>
            )}

          </div>



          {/* CATEGORY */}

          <div className="mb-3">

            <span style={{ color: "#888", fontSize: "14px", marginRight: "8px" }}>
              Category:
            </span>

            <span
              className="badge bg-light text-dark"
              style={{ fontSize: "13px", border: "1px solid #ddd" }}
            >
              {item.category}
            </span>

          </div>



          {/* STOCK STATUS */}

          <div className="mb-3">

            {getStockBadge(item.stock)}

          </div>



          {/* QUANTITY SELECTOR */}

          {item.stock > 0 && (

            <div className="mb-4">

              <label style={{ fontWeight: "600", fontSize: "14px", marginRight: "12px" }}>
                Quantity:
              </label>

              <div
                className="d-inline-flex align-items-center"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >

                <button
                  className="btn btn-outline-secondary"
                  style={{
                    borderRadius: "0",
                    border: "none",
                    padding: "6px 14px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>

                <span
                  style={{
                    padding: "6px 20px",
                    fontSize: "16px",
                    fontWeight: "600",
                    minWidth: "50px",
                    textAlign: "center",
                    borderLeft: "1px solid #ddd",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  {quantity}
                </span>

                <button
                  className="btn btn-outline-secondary"
                  style={{
                    borderRadius: "0",
                    border: "none",
                    padding: "6px 14px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
                >
                  +
                </button>

              </div>

            </div>

          )}



          {/* ACTION BUTTONS */}

          <div className="d-flex gap-3 mb-4 flex-wrap">


            <button

              className="btn btn-success"

              onClick={buyNow}

              disabled={item.stock <=0}

              style={{
                padding: "12px 32px",
                fontWeight: "600",
                fontSize: "15px",
                borderRadius: "10px",
              }}

            >

              Buy Now

            </button>



            {
              element?.count > 0 ?

              (

              <button

                className="btn btn-outline-warning"

                onClick={()=>navigate("/cart")}

                style={{
                  padding: "12px 32px",
                  fontWeight: "600",
                  fontSize: "15px",
                  borderRadius: "10px",
                }}

              >

                Go To Cart

              </button>

              )

              :

              (

              <button

                className="btn btn-success"

                onClick={addToCart}

                disabled={item.stock <=0}

                style={{
                  padding: "12px 32px",
                  fontWeight: "600",
                  fontSize: "15px",
                  borderRadius: "10px",
                }}

              >

                Add To Cart

              </button>

              )

            }


          </div>



          {/* DESCRIPTION */}

          {item.description && (

            <div className="mt-3 p-3" style={{ background: "#f8f9fa", borderRadius: "12px" }}>

              <h5 style={{ fontWeight: "700", marginBottom: "10px" }}>
                Description
              </h5>

              <p style={{ color: "#555", lineHeight: "1.7", marginBottom: 0 }}>
                {item.description}
              </p>

            </div>

          )}


        </div>

      </div>




      {/* ======================
          REVIEWS SECTION
      ======================= */}


      <div className="mt-5">


        <h3 style={{ fontWeight: "700" }}>
          Customer Reviews
        </h3>



        {
          reviews.length > 0 ?

          (

            reviews.map((review)=>(

              <div

                key={review.id}

                className="border rounded p-3 mb-3"

                style={{ borderRadius: "12px" }}

              >

                <div className="d-flex align-items-center mb-2">

                  <div className="d-flex">
                    {renderStars(review.rating)}
                  </div>

                  <span style={{ marginLeft: "8px", color: "#888", fontSize: "13px" }}>
                    {review.rating}/5
                  </span>

                </div>


                <p style={{ marginBottom: 0, color: "#444" }}>
                  {review.comment}
                </p>


              </div>


            ))

          )

          :

          (

            <p style={{ color: "#888" }}>
              No reviews yet
            </p>

          )

        }


      </div>



      {/* ======================
          RELATED PRODUCTS
      ======================= */}

      {relatedProducts.length > 0 && (

        <div className="mt-5">

          <h3 style={{ fontWeight: "700" }}>
            Related Products
          </h3>

          <div className="row mt-3">

            {relatedProducts.map((product) => {

              const hasOffer = (String(product.is_offer).toLowerCase() === "true" || product.is_offer === true || product.is_offer === 1) && product.offer_price && Number(product.offer_price) > 0;

              return (

                <div className="col-lg-3 col-md-4 col-6 mb-3" key={product.id}>

                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onClick={() => {
                      navigate(`/product/${product.id}`);
                      window.scrollTo(0, 0);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >

                    <img
                      src={product.image}
                      alt={product.title}
                      style={{
                        height: "160px",
                        objectFit: "contain",
                        padding: "10px",
                        borderRadius: "12px 12px 0 0",
                      }}
                    />

                    <div className="card-body text-center p-2">

                      <h6 style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {product.title}
                      </h6>

                      {hasOffer ? (
                        <div>
                          <span style={{
                            textDecoration: "line-through",
                            color: "#999",
                            fontSize: "12px",
                            marginRight: "6px",
                          }}>
                            ₹{product.price}
                          </span>
                          <span style={{
                            color: "#ff4444",
                            fontWeight: "700",
                            fontSize: "14px",
                          }}>
                            ₹{product.offer_price}
                          </span>
                        </div>
                      ) : (
                        <span style={{
                          fontWeight: "700",
                          fontSize: "14px",
                          color: "#222",
                        }}>
                          ₹{product.price}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      )}



    </div>

  );

}
