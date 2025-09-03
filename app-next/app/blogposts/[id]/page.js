"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BlogData from "../../../mockData/BlogpostsData.json";
import styles from "./BlogpostDetails.module.css";
import Link from "next/link";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (id) {
      const found = BlogData.find((item) => item.id === parseInt(id));
      setPost(found);
    }
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <div className={`container ${styles.detailsPage}`}>
      <Link href="/BlogPosts" className={styles.backLink}>
        ← Back to Blog Posts
      </Link>

      <div className={styles.card}>
        <img src={post.image} alt={post.title} className={styles.image} />
        <div className={styles.content}>
          <h3 className={styles.title}>{post.title}</h3>
          <p className={styles.meta}>
            by <span>{post.author}</span> • {post.category} • 💬 {post.comments} comments
          </p>
          <p className={styles.excerpt}>{post.excerpt}</p>
        </div>
      </div>
    </div>
  );
}
