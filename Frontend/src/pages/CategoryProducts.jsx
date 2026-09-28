import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactPaginate from "react-paginate";
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

export default function CategoryProducts() {
  const { categoryName } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(categoryName);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sliderRange, setSliderRange] = useState([0, 100000]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  useEffect(() => {
    setPage(1);
  }, [categoryName]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        const categoryValues = getCategoryValues(categoryName);
        const categoryParam = categoryValues.join(",");

        const response = await getProducts(1, 200, "", {
          category: categoryParam,
        });

        setProducts(response.products);

        if (response.products.length > 0) {
          const prices = response.products.map((p) => Number(p.price));
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setSliderRange([min, max]);
          setPriceRange([min, max]);
        }
      } catch (error) {
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
        if (
          sub.value.toLowerCase() === categoryName.toLowerCase() &&
          sub.name !== cat.name
        ) {
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

  const totalPages = Math.ceil(filteredProducts.length / limit);

  const paginatedProducts = useMemo(() => {
    const from = (page - 1) * limit;
    return filteredProducts.slice(from, from + limit);
  }, [filteredProducts, page, limit]);

  const handlePageChange = ({ selected }) => {
    setPage(selected + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container">
      <h2 className="fw-bold mb-4">{displayName}</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
            Price Range:
          </span>
          {!loading && products.length > 0 && (
            <PriceRangeSlider
              min={sliderRange[0]}
              max={sliderRange[1]}
              value={priceRange}
              onChange={setPriceRange}
            />
          )}
          {(priceRange[0] !== sliderRange[0] ||
            priceRange[1] !== sliderRange[1]) && (
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#555" }}>Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={20}>20</option>
            <option value={24}>24</option>
          </select>
          <span style={{ fontSize: "14px", color: "#555" }}>per page</span>
        </div>
      </div>

      <div className="row">
        {loading ? (
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-4">
            <h5 style={{ color: "#888" }}>No products found</h5>
            {(priceRange[0] !== sliderRange[0] ||
              priceRange[1] !== sliderRange[1]) && (
              <button
                onClick={() => setPriceRange(sliderRange)}
                className="btn btn-outline-primary mt-2"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <div className="col-6 col-md-4 col-lg-3 mb-4" key={product.id}>
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
        )}
      </div>

      {filteredProducts.length > 0 && (
        <div className="pagination-wrapper">
          <ReactPaginate
            breakLabel="..."
            nextLabel="Next >"
            onPageChange={handlePageChange}
            pageRangeDisplayed={2}
            marginPagesDisplayed={1}
            pageCount={totalPages || 1}
            forcePage={page - 1}
            previousLabel="< Previous"
            containerClassName="pagination"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            activeClassName="active"
            disabledClassName="disabled"
          />
        </div>
      )}
    </div>
  );
}
