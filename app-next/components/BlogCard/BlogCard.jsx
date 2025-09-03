import Link from "next/link";
import styles from "./BlogCard.module.css";

// export default function BlogCard({ post }) {
//   return (
//     <div className={styles.card}>
//       <img src={post.image} alt={post.title} className={styles.image} />
//       <div className={styles.content}>
//         <h3 className={styles.title}>{post.title}</h3>
//         <p className={styles.meta}>
//           by <span>{post.author}</span> • {post.category} • {post.comments} comments
//         </p>
//         <p className={styles.excerpt}>{post.excerpt}</p>
//       </div>
//     </div>
//   );
// }

export default function BlogCard() {
  return (
    <Link href="/blogposts" style={{ textDecoration: "none" }}>
  
    <div className={styles.card}>
      <img src="https://plus.unsplash.com/premium_photo-1661814278311-d59ab0b4a676?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.title}>Title: </h3>
        <p className={styles.meta}>
          by <span>Author</span> • Catagory
        </p>
        <p className={styles.excerpt}>
          Description: Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Consectetur, nulla?
        </p>
      </div>
    </div>
      </Link>
  );
}
