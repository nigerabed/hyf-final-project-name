"use client";
import { useState } from "react";
import styles from "./Comment.module.css";

export default function Comment() {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (input.trim() === "") return;

    setComments((prev) => [...prev, input]);
    setInput(""); // clear textarea
  };

  return (
    <div className={`container ${styles.commentBox}`}>
      <div>
        <h3>Comments</h3>
        <h4>Leave a Reply</h4>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write your comment..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Post Comment</button>
        </form>

        <ul className={styles.commentList}>
          {comments.map((comment, index) => (
            <li key={index} className={styles.comment}>
              {comment}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
