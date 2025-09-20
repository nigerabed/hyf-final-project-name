"use client";
import styles from "./Card.module.css";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import useFavorite from "@/hooks/useFavorite";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Card({ card, onFavoriteChange, viewLink, size = "regular", showFavorite = true }) {
  // Only provide `initial` when the backend explicitly marks it truthy.
  // If backend doesn't provide a positive favourite flag, allow hook to fall back to localStorage.
  const initialFav = card.favourite ? true : undefined;
  const { favourite, toggle, loading } = useFavorite({ itemId: card.id, itemType: "tour", initial: initialFav });
  const router = useRouter();

  // Normalize price from multiple possible shapes:
  // - mockData: card.price (whole dollars)
  // - API: card.price_minor or card.price_usd (cents/minor units)
  // - accommodations may use price_per_night_minor
  const priceNumber = (() => {
    if (!card) return 0;
    if (typeof card.price === "number") return card.price;
    if (typeof card.price_usd === "number") return card.price_usd / 100;
    if (typeof card.price_minor === "number") return card.price_minor / 100;
    if (typeof card.price_per_night_minor === "number") return card.price_per_night_minor / 100;
    return 0;
  })();

  const currency = card?.currency_code ?? "USD";
  const priceFormatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceNumber);

  // If the item represents an accommodation (per-night price exists), show a per-night label
  const isAccommodation = typeof card?.price_per_night_minor === "number" || typeof card?.price_per_night === "number";
  const priceLabel = isAccommodation ? "/night" : "";

  const rating = card?.average_rating !== undefined ? Number(card.average_rating) : card?.rating;

  function toggleFavorite(e) {
    // Hook handles optimistic update and server call; call it and notify parent
    const next = !favourite;
    toggle(e);
    onFavoriteChange?.({ added: next, itemId: card.id });
  }

  const raw = card?.cover_image_url;
  const placeholder = card?.id
    ? `https://picsum.photos/seed/tour-${card.id}/600/400`
    : "https://picsum.photos/600/400";

  // Normalize incoming image URLs: handle placehold.co, backend-relative paths, or use raw URL
  const normalize = (src) => {
    if (typeof src !== "string" || src.trim() === "") return null;
    const s = src.trim();
    if (s.includes("placehold.co")) {
      // replace placehold.co images with a deterministic picsum seed
      const seed = card?.id ? `tour-${card.id}` : encodeURIComponent(s);
      return `https://picsum.photos/seed/${seed}/600/400`;
    }
    if (s.startsWith("/images/")) {
      // Use local images from app-next/images instead of API_URL
      return s;
    }
    // If it's already a complete URL (starts with http/https), return as is
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return s;
  };

  // For backend-relative paths, start with a placeholder and HEAD-check the file
  const isBackendPath = typeof raw === "string" && raw.trim().startsWith("/images/");
  const initial = isBackendPath ? placeholder : normalize(raw) || "/images/tours/default.jpg";
  const [imageSrc, setImageSrc] = useState(initial);

  // Client-side: HEAD-check backend-relative file and switch to it if present
  useEffect(() => {
    if (!isBackendPath) return;
    let cancelled = false;
    const url = raw; // Use the local path directly
    (async () => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (!cancelled && res.ok) setImageSrc(url);
      } catch (e) {
        // ignore network errors — keep placeholder
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [raw]);

  const handleKeyDown = (e) => {
    if (!viewLink) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(viewLink);
    }
  };

  return (
    <div
      className={styles.travelCard}
      role={viewLink ? "link" : undefined}
      tabIndex={viewLink ? 0 : undefined}
      onClick={() => viewLink && router.push(viewLink)}
      onKeyDown={handleKeyDown}
    >
      <div className={size === "large" ? styles.imageWrapperLarge : styles.imageWrapper}>
        <Image
          src={imageSrc}
          alt={card?.name || "tour image"}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          onError={() => setImageSrc(placeholder)}
        />
      </div>

      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>{card?.name}</h4>

        <div className={styles.cardDetails}>
          <span className={styles.price}>
            {priceFormatted} {priceLabel}
          </span>

          <span className={styles.duration}>{card?.duration_days ?? "-"} days</span>

          {rating !== undefined && !Number.isNaN(rating) && (
            <span className={styles.rating}>★ {rating}</span>
          )}

          {card?.capacity !== undefined && (
            <span className={styles.capacity}>{card.capacity} seats</span>
          )}
        </div>

        <p className={styles.description}>{card?.destination ?? card?.description ?? ""}</p>

        <div className={styles.cardFooter}>
          {showFavorite ? (
            <button
              className={`${styles.heart} ${favourite ? styles.fav : ""}`}
              onClick={toggleFavorite}
              aria-label={favourite ? "Remove favorite" : "Add to favorites"}
              aria-pressed={favourite}
              type="button"
            >
              <Heart size={18} fill={favourite ? "currentColor" : "none"} stroke="currentColor" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
