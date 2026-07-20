import React from "react";
import ProductCart from "../components/ProductCart";
import ReactPaginate from "react-paginate";

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
}) {
  return (
    <div className="bg-white p-3">
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
          <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",marginBottom:"15px",gap:"8px"}}>
            <span style={{fontSize:"14px",color:"#555"}}>Show</span>
            <select
              value={limit}
              onChange={(e)=>setLimit(Number(e.target.value))}
              style={{padding:"5px 10px",border:"1px solid #ccc",borderRadius:"5px",fontSize:"14px",cursor:"pointer"}}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={20}>20</option>
              <option value={24}>24</option>
            </select>
            <span style={{fontSize:"14px",color:"#555"}}>per page</span>
          </div>
          <div className="row g-3 justify-content-center">
            {(products || []).map((product) => (
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
