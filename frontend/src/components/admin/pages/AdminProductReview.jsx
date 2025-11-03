import React, { useEffect, useState } from "react";
import { getReviews, deleteReview, blockReview } from "../../../api/catalog";

export default function AdminProductReview() {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    const res = await getReviews();
    setReviews(res.data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this review?")) {
      await deleteReview(id);
      fetchReviews();
    }
  };

  const handleBlock = async (id) => {
    if (window.confirm("Block this review?")) {
      await blockReview(id);
      fetchReviews();
    }
  };

  return (
    <div>
      <h2>Product Reviews</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Product</th>
            <th>User</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id}>
              <td>{r.product?.name}</td>
              <td>{r.user?.full_name}</td>
              <td>{r.rating}</td>
              <td>{r.comment}</td>
              <td>
                <button onClick={() => handleBlock(r.id)}>Block</button>
                <button onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
