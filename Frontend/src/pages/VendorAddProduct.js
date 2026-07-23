import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { addVendorProduct } from "../services/VendorService";
import { uploadProductImage } from "../services/storageService";
import { productSchema } from "../validations/formSchemas";
import { categories } from "./CategorySection";

export default function VendorAddProduct() {
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getVendorId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id || null;
    } catch {
      return null;
    }
  };

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
      description: "",
      stock: "",
      offer_price: "",
      is_offer: false,
    },
  });

  const isOffer = watch("is_offer");

  const onSubmit = async (data) => {
    setLoading(true);
    const vendorId = getVendorId();

    if (!vendorId) {
      alert("Vendor not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const newProduct = {
        ...data,
        image: imageUrl,
        vendor_id: vendorId,
      };

      await addVendorProduct(newProduct);

      alert("Product added successfully! It will be visible after admin approval.");
      reset();
      setImageFile(null);
      navigate("/vendor/products");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.error || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="amp-wrapper">
      <h2 className="amp-title">Add Product</h2>

      <div style={{ maxWidth: "700px", background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Title</label>
              <input
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                placeholder="Product title"
                {...register("title")}
              />
              {errors.title && (
                <div className="invalid-feedback">{errors.title.message}</div>
              )}
            </div>
            <div>
              <label className="form-label">Price</label>
              <input
                type="number"
                className={`form-control ${errors.price ? "is-invalid" : ""}`}
                placeholder="0.00"
                {...register("price")}
              />
              {errors.price && (
                <div className="invalid-feedback">{errors.price.message}</div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "14px" }}>
            <div>
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
            <div>
              <label className="form-label">Stock</label>
              <input
                type="number"
                className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                placeholder="0"
                {...register("stock")}
              />
              {errors.stock && (
                <div className="invalid-feedback">{errors.stock.message}</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <label className="form-label">Description</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              placeholder="Product description..."
              rows="3"
              style={{ resize: "vertical" }}
              {...register("description")}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description.message}</div>
            )}
          </div>

          <div style={{ marginTop: "14px" }}>
            <label className="form-label">Product Image</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div style={{ marginTop: "14px", padding: "14px", background: "#f8f9fa", borderRadius: "10px", border: "1px solid #e0e0e0" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="is_offer"
                {...register("is_offer")}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label className="form-label mb-0" htmlFor="is_offer" style={{ fontWeight: "600", cursor: "pointer" }}>
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
            disabled={loading}
            style={{
              marginTop: "20px",
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
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
