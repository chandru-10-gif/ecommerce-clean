import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        profiles(name)
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setReviews(data);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Customer Reviews</h3>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className="card shadow-sm mb-3 p-3"
          >
            <h5>{review.profiles?.name || "Anonymous"}</h5>

            <div
              style={{
                color: "#ffc107",
                fontSize: "20px",
              }}
            >
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>

            <p className="mt-2">{review.comment}</p>

            <small className="text-muted">
              {new Date(review.created_at).toLocaleDateString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}