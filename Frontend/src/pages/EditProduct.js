import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { productSchema } from "../validations/formSchemas";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      image: "",
      description: "",
      stock: "",
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );

        reset({
          title: res.data.title || "",
          price: res.data.price || "",
          category: res.data.category || "",
          image: res.data.image || "",
          description: res.data.description || "",
          stock: res.data.stock || "",
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
      await axios.put(`http://localhost:5000/api/products/${id}`, data);

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
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2>Edit Product</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <input
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            placeholder="Title"
            {...register("title")}
          />
          {errors.title && (
            <div className="invalid-feedback">{errors.title.message}</div>
          )}
        </div>

        <div className="mb-3">
          <input
            type="number"
            className={`form-control ${errors.price ? "is-invalid" : ""}`}
            placeholder="Price"
            {...register("price")}
          />
          {errors.price && (
            <div className="invalid-feedback">{errors.price.message}</div>
          )}
        </div>

        <div className="mb-3">
          <input
            className={`form-control ${errors.category ? "is-invalid" : ""}`}
            placeholder="Category"
            {...register("category")}
          />
          {errors.category && (
            <div className="invalid-feedback">{errors.category.message}</div>
          )}
        </div>

        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Image URL"
            {...register("image")}
          />
        </div>

        <div className="mb-3">
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            placeholder="Description"
            rows="4"
            {...register("description")}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description.message}</div>
          )}
        </div>

        <div className="mb-3">
          <input
            type="number"
            className={`form-control ${errors.stock ? "is-invalid" : ""}`}
            placeholder="Stock"
            {...register("stock")}
          />
          {errors.stock && (
            <div className="invalid-feedback">{errors.stock.message}</div>
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
