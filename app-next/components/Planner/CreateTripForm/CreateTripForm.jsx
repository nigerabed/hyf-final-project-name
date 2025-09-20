"use client";
import { useState } from "react";
import styles from "./CreateTripForm.module.css";
import Button from "../Button/Button";

export default function CreateTripForm({
  onTripCreate,
  isLoading,
  onDismissError,
}) {
  const [tripName, setTripName] = useState("Summer Trip to Paris");
  const [destination, setDestination] = useState("Paris, France");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [formError, setFormError] = useState(null);

  const handleCreate = () => {
    onDismissError(); // Dismiss any previous errors
    setAuthError(null);
    setFormError(null);
    // Require user to be logged in before creating a trip
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken")
        : null;
    if (!token) {
      setAuthError(
        "You must be logged in to create a trip. Please log in or create an account to continue."
      );
      return;
    }
    if (!tripName || !destination || !startDate || !endDate) {
      const msg = "Please fill out all fields.";
      setFormError(msg);
      // also notify parent for backward compatibility
      onTripCreate({ error: msg });
      return;
    }

    const destinationParts = destination.split(",").map((part) => part.trim());
    if (destinationParts.length !== 2) {
      onTripCreate({ error: "Destination must be in 'City, Country' format." });
      return;
    }

    const [city_name, country_name] = destinationParts;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (duration_days < 1) {
      const msg = "End date must be after the start date.";
      setFormError(msg);
      onTripCreate({ error: msg });
      return;
    }

    const formData = {
      name: tripName,
      description: `A trip to ${city_name}, ${country_name}.`,
      start_date: startDate,
      duration_days: duration_days,
      destinations: [
        {
          city_name,
          country_name,
          duration_days: duration_days,
          stop_order: 1,
        },
      ],
    };
    // clear any local errors before creating
    setFormError(null);
    onTripCreate(formData);
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.createTripContainer}>
        <h1>Create Your Trip</h1>
        <p className={styles.subtitle}>
          Fill out the details below to get started with your next adventure.
        </p>
        {authError ? (
          <div className={styles.authMessage} role="alert">
            <p>{authError}</p>
            <div>
              <a className={styles.authLink} href="/login">
                Go to Login
              </a>
            </div>
          </div>
        ) : null}
        {formError ? (
          <div className={styles.formError} role="alert">
            {formError}
          </div>
        ) : null}
        <div className={styles.formGroup}>
          <label htmlFor="trip-name">Trip Name</label>
          <input
            id="trip-name"
            type="text"
            placeholder="e.g., Summer Trip to Paris"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="destination">Destination</label>
          <input
            id="destination"
            type="text"
            placeholder="e.g., Paris, France"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className={`${styles.formGroup} ${styles.dateInputs}`}>
          <div style={{ flex: 1 }}>
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Trip & Start Planning →"}
        </Button>
      </div>
    </div>
  );
}
