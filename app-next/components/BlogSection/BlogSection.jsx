"use client";
import { useState, useEffect } from "react";
import BlogData from "../../mockData/BlogpostsData.json";
import BlogCard from "../BlogCard/BlogCard";
import styles from "./BlogSection.module.css";
import Link from "next/link";

export default function BlogSection() {
  const [blogPostData, setBlogPostData] = useState([]);

  useEffect(() => {
    setBlogPostData(BlogData);
    console.log("blogPostData", BlogData);
  }, []);

  return (
    <section>
      <div className="container">
        <h2>User Blog Posts</h2>
        <div className={`container ${styles.gridContainer}`}>
          {blogPostData.slice(0, 3).map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <Link href="/blogposts" style={{ textDecoration: "none" }}>
          <button className={styles.exploreBtn}>Explore more</button>
        </Link>
      </div>
    </section>
  );
}
