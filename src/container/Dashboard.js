import React from "react";
import ProductCart from "../components/ProductCart";

export default function Dashboard({
  search,
  products,
  singleProductLoading,
  setSingleProductLoading,
  loading
}) {

  const filteredProducts =
    products.filter((product) =>
      product?.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="bg-white p-3">

      {loading ? (

        <div className="d-flex flex-wrap justify-content-center gap-3">

          {[1,2,3,4,5,6].map((item) => (

            <div
              key={item}
              className="skeleton-card"
            >
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>

          ))}

        </div>

      ) : (

        <div className="row g-3 justify-content-center">

          {filteredProducts.map((product) => (

            <div
  key={product.id}
  className="col-6 col-md-4 col-lg-3"
>
              <ProductCart
                {...product}
                singleProductLoading={singleProductLoading}
                setSingleProductLoading={setSingleProductLoading}
              />
            </div>

          ))}

        </div>

      )}

    </div>
  );
}