import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../services/ProductService";
import ProductCart from "../components/ProductCart";
import { categories } from "./CategorySection";
import PriceRangeSlider from "../customcomponents/PriceRangeSlider";

function getCategoryValues(categoryName) {
  const name = categoryName.toLowerCase();
  for (const cat of categories) {
    if (cat.value.toLowerCase() === name) {
      return cat.subcategories.map((s) => s.value);
    }
    for (const sub of cat.subcategories) {
      if (sub.value.toLowerCase() === name) {
        return [sub.value];
      }
    }
  }
  return [categoryName];
}

export default function CategoryProducts(){

  const { categoryName } = useParams();

  const [products,setProducts] = useState([]);
  const [loading,setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(categoryName);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sliderRange, setSliderRange] = useState([0, 100000]);

useEffect(() => {

  const fetchCategoryProducts = async () => {

    try {

      setLoading(true);

      const categoryValues = getCategoryValues(categoryName);
      const categoryParam = categoryValues.join(",");

      const response = await getProducts(
        1,
        100,
        "",
        { category: categoryParam }
      );

      setProducts(response.products);

      if (response.products.length > 0) {
        const prices = response.products.map(p => Number(p.price));
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setSliderRange([min, max]);
        setPriceRange([min, max]);
      }

    } catch(error){

      console.log(error);

    } finally {

      setLoading(false);

    }

  };


  fetchCategoryProducts();

}, [categoryName]);

useEffect(() => {
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      if (sub.value.toLowerCase() === categoryName.toLowerCase() && sub.name !== cat.name) {
        setDisplayName(sub.name);
        return;
      }
    }
    if (cat.value.toLowerCase() === categoryName.toLowerCase()) {
      setDisplayName(cat.name);
      return;
    }
  }
  setDisplayName(categoryName);
}, [categoryName]);

const filteredProducts = useMemo(() => {
  return products.filter((p) => {
    const price = Number(p.price);
    if (price < priceRange[0] || price > priceRange[1]) return false;
    return true;
  });
}, [products, priceRange]);

  return(

    <div className="container">

      <h2 className="fw-bold mb-4">
        {displayName}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Price Range:</span>
        {!loading && products.length > 0 && (
          <PriceRangeSlider min={sliderRange[0]} max={sliderRange[1]} value={priceRange} onChange={setPriceRange} />
        )}
        {(priceRange[0] !== sliderRange[0] || priceRange[1] !== sliderRange[1]) && (
          <button
            onClick={() => setPriceRange(sliderRange)}
            style={{
              padding: "5px 12px",
              border: "1px solid #dc3545",
              background: "#fff",
              color: "#dc3545",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>


      <div className="row">

      {
        loading ? (
          <h4>Loading...</h4>
        )
        :
        filteredProducts.length === 0 ? (
          <div className="text-center py-4">
            <h5 style={{ color: "#888" }}>No products found</h5>
            {(priceRange[0] !== sliderRange[0] || priceRange[1] !== sliderRange[1]) && (
              <button
                onClick={() => setPriceRange(sliderRange)}
                className="btn btn-outline-primary mt-2"
              >
                Clear Filter
              </button>
            )}
          </div>
        )
        :
        filteredProducts.map(product=>(

          <div
            className="col-md-3 mb-4"
            key={product.id}
          >

            <ProductCart
  id={product.id}
  title={product.title}
  price={product.price}
  image={product.image}
  category={product.category}
  is_offer={product.is_offer}
  offer_price={product.offer_price}
/>

          </div>

        ))

      }

      </div>

    </div>

  )

}
