"use client";
import styles from "./Trip.module.css";
import traveldata from "../../mockData/travel-cards.json";
import { useEffect, useState } from "react";
import Card from "@/components/Card/Card";
export default function TripPage() {
  const [travelCardData, setTravelCardData] = useState([]);
  useEffect(() => {
    setTravelCardData(traveldata);
    console.log("travelCardData", traveldata);
  }, []);
  return (
    <>
      <div className={`${styles.info}`}>
        <h2 className={`container ${styles.heading}`}>
          Explore Your Trips
        </h2>
        <div className={styles.gridContainer}>
          {travelCardData.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>
    </>
  );
}
