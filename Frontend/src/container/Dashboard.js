import React, { useState, useMemo, useEffect } from "react";
import ProductCart from "../components/ProductCart";
import ReactPaginate from "react-paginate";
import CategorySection from "../pages/CategorySection";
import { categories } from "../pages/CategorySection";
import OfferSection from "../pages/OfferSection";
import PriceRangeSlider from "../customcomponents/PriceRangeSlider";

export default function Dashboard({
  products,
  singleProductLoading,
  setSingleProductLoading,
  loading,
  page,
  totalPages,
  limit,
  setLimit,
  handlePageChange,
  category,
  setCategory,
  sortBy,
  setSortBy,
  inStock,
  setInStock,
}) {
  const sliderRange = useMemo(() => {
    if (!products || products.length === 0) return [0, 100000];
    const prices = products.map(p => Number(p.price)).filter(p => !isNaN(p));
    if (prices.length === 0) return [0, 100000];
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  const [priceRange, setPriceRange] = useState(sliderRange);

  useEffect(() => {
    setPriceRange(sliderRange);
  }, [sliderRange]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const filtered = products.filter((p) => {
      const price = Number(p.price);
      if (price < priceRange[0] || price > priceRange[1]) return false;
      return true;
    });
    const isOffer = (p) => (String(p.is_offer).toLowerCase() === "true" || p.is_offer === true || p.is_offer === 1) && p.offer_price && Number(p.offer_price) > 0;
    const offerProducts = filtered.filter((p) => isOffer(p));
    const regularProducts = filtered.filter((p) => !isOffer(p));
    return [...offerProducts, ...regularProducts];
  }, [products, priceRange]);

  return (
    <div className="bg-white p-3">
        <CategorySection />
        <OfferSection />

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
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Price Range:</span>
              {!loading && products && products.length > 0 && (
                <PriceRangeSlider min={sliderRange[0]} max={sliderRange[1]} value={priceRange} onChange={setPriceRange} />
              )}
              {(priceRange[0] !== sliderRange[0] || priceRange[1] !== sliderRange[1] || category || inStock) && (
                <button
                  onClick={() => { setPriceRange(sliderRange); setCategory(""); setInStock(false); }}
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

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <optgroup key={cat.name} label={cat.name}>
                    {cat.subcategories.map((sub) => (
                      <option key={sub.value} value={sub.value}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price Low-High</option>
                <option value="price_desc">Price High-Low</option>
                <option value="rating">Rating</option>
              </select>

              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#333", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                In Stock Only
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "14px", color: "#555" }}>Show</span>
                <select
                  value={limit}
                  onChange={(e)=>setLimit(Number(e.target.value))}
                  style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px", cursor: "pointer" }}
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

          </div>

          <div className="row g-3 justify-content-center">
            {(filteredProducts || []).map((product) => (
              <div
                key={product.id}
                className="col-6 col-md-4 col-lg-3"
              >
                <ProductCart
                  {...product}
                  singleProductLoading={
                    singleProductLoading
                  }
                  setSingleProductLoading={
                    setSingleProductLoading
                  }
                />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-5">
              <h5 style={{ color: "#888" }}>No products found in this price range</h5>
              <button
                onClick={() => { setPriceRange(sliderRange); setCategory(""); setInStock(false); }}
                className="btn btn-outline-primary mt-2"
              >
                Clear Filter
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <ReactPaginate
                breakLabel="..."
                nextLabel="Next >"
                onPageChange={handlePageChange}
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
                pageCount={totalPages}
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
        </>
      )}
    </div>
  );
}
