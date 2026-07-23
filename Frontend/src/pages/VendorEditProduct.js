import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useNavigate } from "react-router-dom";
import { getVendorProduct, updateVendorProduct } from "../services/VendorService";
import { productSchema } from "../validations/formSchemas";
import { categories } from "./CategorySection";

export default function VendorEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productStatus, setProductStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: "",
      price: "",
      category: "",
      image: "",
      description: "",
      stock: "",
      offer_price: "",
      is_offer: false,
    },
  });

  const isOffer = watch("is_offer");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getVendorProduct(id);
        const product = res.product || res;

        const status = product.approval_status || "";
        setProductStatus(status);
        setRejectionReason(product.admin_notes || "");

        if (status !== "pending" && status !== "rejected") {
          alert("This product cannot be edited. Only pending or rejected products can be edited.");
          navigate("/vendor/products");
          return;
        }

        reset({
          title: product.title || "",
          price: product.price || "",
          category: product.category || "",
          image: product.image || "",
          description: product.description || "",
          stock: product.stock || "",
          offer_price: product.offer_price || "",
          is_offer: product.is_offer || false,
        });

        setLoading(false);
      } catch (err) {
        console.log("Error loading product:", err);
        setLoading(false);
        alert("Failed to load product");
        navigate("/vendor/products");
      }
    };

    fetchProduct();
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      await updateVendorProduct(id, data);

      alert("Product updated successfully!");
      navigate("/vendor/products");
    } catch (err) {
      console.log("Update error:", err);
      alert(err.response?.data?.error || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <h4 className="text-center mt-5">Loading...</h4>;
  }

  return (
    <div className="amp-wrapper">
      <h2 className="amp-title">Edit Product</h2>

      {productStatus === "rejected" && rejectionReason && (
        <div
          style={{
            padding: "14px 18px",
            background: "#f8d7da",
            borderRadius: "10px",
            color: "#721c24",
            marginBottom: "20px",
            border: "1px solid #f5c6cb",
          }}
        >
          <strong>Rejection Reason:</strong> {rejectionReason}
        </div>
      )}

      <div style={{ maxWidth: "700px", background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              placeholder="Enter product title"
              {...register("title")}
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              className={`form-control ${errors.price ? "is-invalid" : ""}`}
              placeholder="Enter product price"
              {...register("price")}
            />
            {errors.price && (
              <div className="invalid-feedback">{errors.price.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              className={`form-control ${errors.category ? "is-invalid" : ""}`}
              {...register("category")}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <optgroup key={cat.name} label={cat.name}>
                  {cat.subcategories.map((sub) => (
                    <option key={sub.value} value={sub.value}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.category && (
              <div className="invalid-feedback">{errors.category.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Image URL</label>
            <input
              className="form-control"
              placeholder="Enter image URL"
              {...register("image")}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              placeholder="Enter description"
              rows="3"
              style={{ resize: "vertical" }}
              {...register("description")}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Stock</label>
            <input
              type="number"
              className={`form-control ${errors.stock ? "is-invalid" : ""}`}
              placeholder="Enter available stock"
              {...register("stock")}
            />
            {errors.stock && (
              <div className="invalid-feedback">{errors.stock.message}</div>
            )}
          </div>

          <div className="mb-3" style={{ padding: "14px", background: "#f8f9fa", borderRadius: "10px", border: "1px solid #e0e0e0" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="is_offer_edit"
                {...register("is_offer")}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label className="form-label mb-0" htmlFor="is_offer_edit" style={{ fontWeight: "600", cursor: "pointer" }}>
                Mark as Offer Product
              </label>
            </div>
            {isOffer && (
              <div>
                <label className="form-label">Offer Price</label>
                <input
                  type="number"
                  className={`form-control ${errors.offer_price ? "is-invalid" : ""}`}
                  placeholder="Discounted price"
                  {...register("offer_price")}
                />
                {errors.offer_price && (
                  <div className="invalid-feedback">{errors.offer_price.message}</div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(102,126,234,0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 24px rgba(102,126,234,0.45)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 16px rgba(102,126,234,0.35)";
            }}
          >
            {submitting ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
