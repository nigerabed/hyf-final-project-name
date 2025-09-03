"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BlogData from "../../mockData/BlogpostsData.json";
import styles from "./Details.module.css";
import Link from "next/link";

export default function BlogDetailsPage() {
  //   const { id } = useParams();
  //   const [post, setPost] = useState(null);

  //   useEffect(() => {
  //     if (id) {
  //       const foundPost = BlogData.find(
  //         (item) => item.id === parseInt(id) // match ID
  //       );
  //       setPost(foundPost);
  //     }
  //   }, [id]);

  //   if (!post) return <p>Loading...</p>;

  return (
    <div className={`container ${styles.detailsPage}`}>
      <div>
        <Link href="/BlogPosts" className={styles.backLink}>
          ← Back to Blog Posts
        </Link>

        <div className={styles.card}>
          <img src={BlogData[0].image} alt="" className={styles.image} />
          <div className={styles.content}>
            <h3 className={styles.title}>Title:</h3>
            <p className={styles.meta}>
              by <span>author</span> • category • 💬 comments
            </p>
            <p className={styles.excerpt}>Expert</p>
          </div>
        </div>
      </div>
    </div>
  );
}
