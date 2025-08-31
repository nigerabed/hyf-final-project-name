"use client"; 
import { useEffect, useState } from "react";
import styles from "./TravelCards.module.css";
import traveldata from "../../mockData/travel-cards.json";
import Card from "../Card/Card";
import Link from "next/link";
import globalcss from '../../app/globals.css';

export default function TravelCards() {
  const [travelCardData, setTravelCardData] = useState([]);

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  
  // useEffect(() => {
  //   async function fetchTravelData() {
  //     try {
  //       const res = await fetch("/api/travel-cards"); 
  //       if (!res.ok) {
  //         throw new Error("Failed to fetch travel data");
  //       }
  //       const data = await res.json();
  //       setTravelCardData(data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchTravelData();
  // }, []);


  // simulate API fetch
  useEffect(() => {
    setTravelCardData(traveldata);
    console.log("travelCardData", traveldata);
  }, []);

  return (
    <>
    <section className={`${styles.travelSection}`}>
  <h2 className={`container ${styles.sectionTitle}`}>Explore Your Trips</h2>
      <div className={styles.gridContainer}>
        {travelCardData.slice(0, 3).map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      <Link href="/trips" style={{ textDecoration: "none" }}>
        <button className={styles.exploreBtn}>Explore more</button>
      </Link>
      </section>
    </>
  );
}
