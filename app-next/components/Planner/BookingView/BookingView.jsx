"use client";

import { useState, useEffect } from "react";
import styles from "./BookingView.module.css";
import Button from "../Button/Button";

export default function BookingView({
  accommodation,
  flight,
  onPay,
  isLoading,
  initialTravelers = 1,
  tripData,
}) {
  const [numTravelers, setNumTravelers] = useState(initialTravelers);

  const accommodationCost =
    ((accommodation?.price_per_night_minor || 0) / 100) *
    (tripData?.duration_days || 1);
  const flightCost = (flight?.price_minor || 0) / 100;
  const totalCost = accommodationCost + flightCost * numTravelers;

  const handlePay = () => {
    onPay(numTravelers);
  };

  return (
    <div className={styles.bookingPage}>
      <div className={styles.bookingContainer}>
        <h2>Confirm Your Booking</h2>
        <p>Please review your trip details and complete your payment.</p>

        <div className={styles.formGroup}>
          <label htmlFor="travelers">Number of Travelers</label>
          <input
            type="number"
            id="travelers"
            value={numTravelers}
            onChange={(e) =>
              setNumTravelers(Math.max(1, parseInt(e.target.value, 10)) || 1)
            }
            min="1"
          />
        </div>

        <ul className={styles.costSummary}>
          <li>
            <span>Accommodations (Total)</span>
            <span>${accommodationCost.toFixed(2)}</span>
          </li>
          <li>
            <span>Flights (per person)</span>
            <span>${flightCost.toFixed(2)}</span>
          </li>
          <li className={styles.total}>
            <span>Total for {numTravelers} traveler(s)</span>
            <span>${totalCost.toFixed(2)}</span>
          </li>
        </ul>
        <div className={styles.mockForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name on Card</label>
            <input type="text" id="name" defaultValue="Alex Doe" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="card">Card Number</label>
            <input type="text" id="card" defaultValue="**** **** **** 1234" />
          </div>
          <Button onClick={handlePay} disabled={isLoading}>
            {isLoading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
