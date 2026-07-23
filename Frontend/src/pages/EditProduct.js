import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { productSchema } from "../validations/formSchemas";
import { categories } from "./CategorySection";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/products/${id}`
        );

        reset({
          title: res.data.title || "",
          price: res.data.price || "",
          category: res.data.category || "",
          image: res.data.image || "",
          description: res.data.description || "",
          stock: res.data.stock || "",
          offer_price: res.data.offer_price || "",
          is_offer: res.data.is_offer || false,
        });

        setLoading(false);
      } catch (err) {
        console.log("Error loading product:", err);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/products/${id}`, data);

      alert("Product Updated Successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.log("Update error:", err);
      alert("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <h4 className="text-center mt-5">Loading...</h4>;
  }

  return (
    <div className="container mt-5 edit-product-container" style={{ maxWidth: "600px" }}>
      <h2>Edit Product</h2>

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
          className="btn btn-primary w-100"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}
