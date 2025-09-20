"use client";

import { useState, useEffect } from "react";
import styles from "./BookingView.module.css";
import Button from "../Button/Button";
import mockData from "../mockData";

export default function BookingView({
  accommodation,
  flight,
  onPay,
  isLoading,
  initialTravelers = 1,
  tripData,
}) {
  const [numTravelers, setNumTravelers] = useState(initialTravelers);
  const [lastKnownFlight, setLastKnownFlight] = useState(null);

  // Use provided props, or fallback to tripData, or finally to mockData so the booking
  // view can show a reasonable price even when a selected item has no price field.
  const resolvedAccommodation =
    accommodation || tripData?.accommodations?.[0] || mockData.accommodations[0] || null;
  const resolvedFlight = flight || tripData?.flights?.[0] || mockData.flights[0] || null;

  // Preserve the last flight that had a valid price so transient refreshes
  // (which may temporarily return no flights) don't wipe the UI price.
  useEffect(() => {
    const p = getDollarPrice(resolvedFlight);
    if (p && p > 0) {
      setLastKnownFlight(resolvedFlight);
    }
  }, [resolvedFlight]);
  // Helper: try multiple fields and formats to extract a numeric dollar amount
  const parseMoney = (val) => {
    if (val == null) return null;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      // strip currency symbols and commas
      const cleaned = val.replace(/[^0-9.\-]/g, "");
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const getDollarPrice = (obj) => {
    if (!obj) return 0;
    // common shapes
    const candidates = [
      obj.price,
      obj.price_per_night,
      obj.price_per_night_minor ? obj.price_per_night_minor / 100 : null,
      obj.price_minor ? obj.price_minor / 100 : null,
      obj.price_usd ? obj.price_usd / 100 : null,
      obj.amount,
      obj.cost,
      obj.fare,
      obj.total_price,
    ];
    for (const c of candidates) {
      const parsed = parseMoney(c);
      if (parsed != null) return parsed;
    }
    return 0;
  };

  const accommodationPricePerNight = getDollarPrice(resolvedAccommodation);
  const accommodationCost = accommodationPricePerNight * (tripData?.duration_days || 1);

  // Prefer the current resolvedFlight price if available; otherwise fall back to the last known priced flight.
  const currentFlightPrice = getDollarPrice(resolvedFlight);
  const flightCost = currentFlightPrice > 0 ? currentFlightPrice : getDollarPrice(lastKnownFlight);

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
            onChange={(e) => setNumTravelers(Math.max(1, parseInt(e.target.value, 10)) || 1)}
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
