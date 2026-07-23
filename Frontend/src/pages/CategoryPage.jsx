import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CategoryPage() {

  const { categoryName } = useParams();

  const [products, setProducts] = useState([]);
  const [loading,setLoading] = useState(true);


  useEffect(() => {

    const fetchCategoryProducts = async () => {

      try {

        setLoading(true);

        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/products`,
          {
            params:{
              category: categoryName
            }
          }
        );


        console.log("API Response:", response.data);


        setProducts(
          response.data.products || response.data
        );


      } catch(error){

        console.log("Category Error:",error);

      } finally {

        setLoading(false);

      }

    };


    fetchCategoryProducts();

  },[categoryName]);



  return (
    <div className="container mt-5 pt-5">

      <h2 className="fw-bold mb-4">
        {categoryName}
      </h2>


      {
        loading ? (
          <h4>Loading...</h4>
        )
        :
        products.length === 0 ? (
          <h4>No Products Found</h4>
        )
        :
        (
          <div className="row">

          {
            products.map(product=>(
              <div 
                className="col-md-3 mb-4"
                key={product.id}
              >

                <div className="card h-100">

                  <img
                    src={product.image}
                    className="card-img-top"
                    alt={product.title}
                  />

                  <div className="card-body">

                    <h6>
                      {product.title}
                    </h6>

                    <p>
                      ₹ {product.price}
                    </p>

                  </div>

                </div>

              </div>
            ))
          }

          </div>
        )
      }


    </div>
  );
}