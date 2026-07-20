import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { uploadProductImage } from "../services/storageService";
import { productSchema } from "../validations/formSchemas";

export default function AddProduct({ onSuccess }) {
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: "",
      price: "",
      category: "",
      description: "",
      stock: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const newProduct = {
        ...data,
        image: imageUrl,
      };

      await axios.post("http://localhost:5000/api/products", newProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product Added Successfully!");

      reset();
      setImageFile(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.error || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
      >
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginTop: "14px",
        }}
      >
        <div>
          <label className="form-label">Category</label>
          <input
            className={`form-control ${errors.category ? "is-invalid" : ""}`}
            placeholder="e.g. Electronics"
            {...register("category")}
          />
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
  );
}
