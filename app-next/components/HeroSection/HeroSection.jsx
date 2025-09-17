"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./HeroSection.module.css";

const images = [
  "/hero-images/dino-reichmuth-A5rCN8626Ck-unsplash.webp",
  "/hero-images/drif-riadh-YpkuRn54y4w-unsplash.webp",
  "/hero-images/jack-anstey-XVoyX7l9ocY-unsplash.webp",
  "/hero-images/neom-STV2s3FYw7Y-unsplash.webp",
  "/hero-images/nils-nedel-ONpGBpns3cs-unsplash.webp",
  "/hero-images/pietro-de-grandi-T7K4aEPoGGk-unsplash.webp",
  "/hero-images/rebe-adelaida-zunQwMy5B6M-unsplash.webp",
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [transitionImage, setTransitionImage] = useState(null);

  useEffect(() => {
    if (currentImage >= images.length) {
      setCurrentImage(0);
    }
  }, [images.length, currentImage]);

  // No manual preloading required when using Next.js Image with priority/placeholder

  useEffect(() => {
    let intervalId = null;
    let timeoutId = null;
    const start = () => {
      intervalId = setInterval(() => {
        const next = (currentImage + 1) % images.length;
        // show transition layer with next image
        setTransitionImage(next);
        // after transition duration commit to next image and clear transitionImage
        timeoutId = setTimeout(() => {
          setCurrentImage(next);
          setTransitionImage(null);
        }, 1000); // match CSS transition duration
      }, 4000);
    };

    start();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]);

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.bgWrapper} aria-hidden>
        {/* Base layer: always shows the committed current image */}
        <div className={`${styles.bgLayer} ${styles["bgLayer--visible"]}`}>
          <Image
            src={images[currentImage]}
            alt=""
            fill
            priority={true}
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='9'></svg>`}
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        {/* Transition layer: appears when transitionImage is non-null and fades in over the base */}
        <div
          className={`${styles.bgLayer} ${transitionImage !== null ? styles["bgLayer--visible"] : ""}`}
        >
          {transitionImage !== null && (
            <Image
              src={images[transitionImage]}
              alt=""
              fill
              priority={false}
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='9'></svg>`}
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          )}
        </div>
      </div>

      <div className={styles.overlay} style={{ position: "relative", zIndex: 1 }}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Make Your Next Group Adventure Unforgettable</h1>
          <p className={styles.subTitle}>
            Easily plan, organize, and share trips with friends and family.
          </p>
        </div>
      </div>
    </section>
  );
}
