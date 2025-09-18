"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import styles from "./planner.module.css";
import CreateTripForm from "../../../components/planner/CreateTripForm/CreateTripForm";
import ProgressTracker from "../../../components/planner/ProgressTracker/ProgressTracker";
import Sidebar from "../../../components/planner/Sidebar/Sidebar";
import MainArea from "../../../components/planner/MainArea/MainArea";
import BookingView from "../../../components/planner/BookingView/BookingView";
import mockData from "../../../components/planner/mockData";
import EmptyState from "../../../components/planner/MainArea/EmptyState";
import SuggestionGrid from "../../../components/planner/MainArea/SuggestionGrid";
import ItineraryDisplay from "../../../components/planner/MainArea/ItineraryDisplay";
import AccommodationDisplay from "../../../components/planner/MainArea/AccommodationDisplay";
import FlightDisplay from "../../../components/planner/MainArea/FlightDisplay";

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className={styles.errorBanner}>
      <span>{message}</span>
      <button onClick={onDismiss}>&times;</button>
    </div>
  );
};

export default function PlannerPage() {
  const { tripId } = useParams();
  const [view, setView] = useState("loading");
  const [tripData, setTripData] = useState(null);
  const [planningPhase, setPlanningPhase] = useState("preferences");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [shortlistedItems, setShortlistedItems] = useState([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const checkOwnership = (trip) => {
    const userData = localStorage.getItem("user");
    if (userData && trip) {
      const currentUser = JSON.parse(userData);
      setIsOwner(trip.owner_id === currentUser.id);
    }
  };

  const fetchTripData = useCallback(
    async (isInitialLoad = false) => {
      if (tripId === "new" || !tripId) {
        setView("create");
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const res = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/shortlist`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/itinerary`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/chat`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [tripRes, shortlistRes, itineraryRes, chatRes] = res;
        if (!tripRes.ok) throw new Error("Failed to load trip data.");

        const tripResult = await tripRes.json();
        setTripData(tripResult.data);
        setCollaborators(tripResult.data.collaborators || []);
        checkOwnership(tripResult.data);

        if (
          tripResult.data.accommodations &&
          tripResult.data.accommodations.length > 0
        ) {
          setSelectedAccommodation(tripResult.data.accommodations[0]);
        }
        if (tripResult.data.flights && tripResult.data.flights.length > 0) {
          setSelectedFlight(tripResult.data.flights[0]);
        }

        const shortlistResult = await shortlistRes.json();
        setShortlistedItems(shortlistResult.data);

        if (itineraryRes.ok) {
          const itineraryResult = await itineraryRes.json();
          setItinerary(itineraryResult.data);
        }
        if (chatRes.ok) {
          const chatResult = await chatRes.json();
          setMessages(chatResult.data);
        }

        if (isInitialLoad) {
          setView("planner");
          const initialPhase =
            tripResult.data.destinations?.length > 0
              ? "preferences"
              : "no_destinations";
          setPlanningPhase(initialPhase);
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
        setError(
          "Could not load your trip data. Please ensure you are logged in and have permission."
        );
      }
    },
    [tripId]
  );

  // Initial load effect
  useEffect(() => {
    fetchTripData(true);
  }, [tripId, fetchTripData]);

  // Periodic refresh for chat/shortlist
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTripData();
    }, 15000);
    return () => clearInterval(intervalId);
  }, [fetchTripData]);

  const handleTripCreated = async (formData) => {
    setError(null);
    if (formData.error) {
      setError(formData.error);
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/build`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create trip.");
      }
      const result = await response.json();
      const newTrip = result.data;
      window.location.replace(`/planner/${newTrip.id}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      setError(`Failed to create trip: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestions = async (preferenceText) => {
    setError(null);
    if (tripId === "new" || !tripId) {
      setError("Please create a trip before getting AI suggestions.");
      return;
    }
    if (!preferenceText || preferenceText.trim().length === 0) {
      setError(
        "Please add a short description of your preferences for the AI to help you."
      );
      return;
    }
    if (!tripData?.destinations || tripData.destinations.length === 0) {
      setError(
        "Please add at least one destination to your trip before getting AI suggestions."
      );
      return;
    }

    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/ai-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ preferences: preferenceText }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get suggestions.");
      }
      const returnedSuggestions = await response.json();
      setSuggestions(returnedSuggestions.data);
      setPlanningPhase("shortlisting");
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      setError(
        `Could not get suggestions: ${error.message}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToShortlist = async (attraction) => {
    setError(null);
    if (shortlistedItems.some((item) => item.id === attraction.id)) {
      setError("This item is already on your shortlist.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/shortlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ attraction_id: attraction.id }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to shortlist.");
      }
      const newItem = await response.json();
      setShortlistedItems((prevItems) => [
        ...prevItems,
        { ...attraction, shortlistItemId: newItem.data.id },
      ]);
      setError(null);
    } catch (error) {
      console.error("Error adding to shortlist:", error);
      setError(`Could not add item to shortlist: ${error.message}.`);
    }
  };

  const handleVote = async (shortlistItemId) => {
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/shortlist/${shortlistItemId}/vote`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update vote.");
      }
      const result = await response.json();
      setShortlistedItems((currentItems) =>
        currentItems.map((item) => {
          if (item.shortlistItemId === shortlistItemId) {
            return {
              ...item,
              voteCount: result.voteCount,
              userHasVoted: result.userHasVoted,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error voting:", error);
      setError(`Could not process your vote: ${error.message}.`);
    }
  };

  const handleGenerateItinerary = async () => {
    setError(null);
    if (shortlistedItems.length < 1) {
      setError(
        "Please shortlist at least one attraction to generate an itinerary."
      );
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/itinerary`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate itinerary.");
      }
      const result = await response.json();
      setItinerary(result.data);
      setPlanningPhase("itinerary");
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setError(
        `Could not generate itinerary: ${error.message}. Please ensure items are shortlisted.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyItinerary = async (command) => {
    setError(null);
    if (!itinerary) {
      setError("An itinerary must be generated before it can be modified.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/itinerary/modify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            command: command,
            currentItinerary: itinerary,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to modify itinerary.");
      }
      const result = await response.json();
      setItinerary(result.data);
    } catch (error) {
      console.error("Error modifying itinerary:", error);
      setError(
        `Could not modify itinerary: ${error.message}. Please try a different command.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAccommodation = async () => {
    setError(null);
    if (!selectedAccommodation || !tripData?.destinations?.[0]?.id) {
      setError("Please select an accommodation before confirming.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/accommodations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            destination_id: tripData.destinations[0].id,
            name: selectedAccommodation.name,
            type: selectedAccommodation.type || "hotel",
            rating: selectedAccommodation.rating || 0,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save your hotel selection."
        );
      }
      setPlanningPhase("flights");
    } catch (error) {
      console.error("Error confirming accommodation:", error);
      setError(`Could not save your hotel selection: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlight = async () => {
    setError(null);
    if (!selectedFlight || !tripData?.destinations?.[0]?.id) {
      setError("Please select a flight before finalizing.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/flights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            departs_from_destination_id: tripData.destinations[0].id,
            arrives_at_destination_id: tripData.destinations[0].id,
            airline: selectedFlight.airline,
            flight_number: selectedFlight.flight_number,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save your flight selection."
        );
      }
      setPlanningPhase("flights");
      setView("booking");
    } catch (error) {
      console.error("Error saving flight selection:", error);
      setError(`Could not save your flight selection: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToBooking = () => {
    if (!selectedFlight) {
      setError("Please select a flight before finalizing.");
      return;
    }
    handleSaveFlight();
  };

  const handleConfirmBooking = async (numTravelers) => {
    setError(null);
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/custom-trip`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trip_id: tripId,
            num_travelers: numTravelers,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Booking failed.");
      }
      alert("Booking successful! Your trip is confirmed.");
      window.location.href = "/user";
    } catch (error) {
      console.error("Error confirming booking:", error);
      setError(`There was an error confirming your booking: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageContent) => {
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Message failed to send.");
      }
      fetchTripData();
    } catch (error) {
      console.error(error);
      setError(`Failed to send message: ${error.message}.`);
    }
  };

  const handleStartVote = () => {
    if (shortlistedItems.length > 0) setPlanningPhase("voting");
    else setError("Please shortlist at least one attraction to start a vote.");
  };

  const handleSelectAccommodations = () => setPlanningPhase("accommodations");
  const handleSelectFlights = () => setPlanningPhase("flights");

  const renderMainContent = () => {
    switch (planningPhase) {
      case "preferences":
        return (
          <EmptyState destination={tripData?.destinations?.[0]?.city_name} />
        );
      case "shortlisting":
      case "voting":
        return (
          <SuggestionGrid
            suggestions={suggestions}
            onAddToShortlist={handleAddToShortlist}
            shortlistedItems={shortlistedItems}
          />
        );
      case "itinerary":
        return itinerary ? (
          <ItineraryDisplay
            itinerary={itinerary}
            onModifyItinerary={handleModifyItinerary}
            isLoading={isLoading}
          />
        ) : (
          <div>Generating itinerary...</div>
        );
      case "accommodations":
        return (
          <AccommodationDisplay
            accommodations={mockData.accommodations}
            onSelectAccommodation={setSelectedAccommodation}
            selectedAccommodation={selectedAccommodation}
            onConfirm={handleConfirmAccommodation}
            tripData={tripData}
          />
        );
      case "flights":
        return (
          <FlightDisplay
            flights={mockData.flights}
            onSelectFlight={setSelectedFlight}
            selectedFlight={selectedFlight}
          />
        );
      default:
        return <EmptyState />;
    }
  };

  if (view === "loading") {
    return <div>Loading your trip...</div>;
  }

  if (view === "create") {
    return (
      <main className={styles.createFormLayout}>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <CreateTripForm
          onTripCreate={handleTripCreated}
          isLoading={isLoading}
          onDismissError={() => setError(null)}
        />
      </main>
    );
  }

  if (view === "planner") {
    return (
      <main className={styles.plannerLayout}>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <ProgressTracker
          currentPhase={planningPhase}
          onPhaseChange={setPlanningPhase}
        />
        <div className={styles.plannerContent}>
          <aside className={styles.sidebarContainer}>
            <Sidebar
              phase={planningPhase}
              isLoading={isLoading}
              onGetSuggestions={handleGetSuggestions}
              shortlistedItems={shortlistedItems}
              selectedAccommodation={selectedAccommodation}
              selectedFlight={selectedFlight}
              messages={messages}
              onSendMessage={handleSendMessage}
              onStartVote={handleStartVote}
              onVote={handleVote}
              onGenerateItinerary={handleGenerateItinerary}
              onSelectAccommodations={handleSelectAccommodations}
              onSelectFlights={handleSelectFlights}
              onGoToBooking={handleGoToBooking}
              onFinalize={handleSaveFlight}
            />
          </aside>
          <section className={styles.mainAreaContainer}>
            <MainArea isOwner={isOwner} collaborators={collaborators}>
              {renderMainContent()}
            </MainArea>
          </section>
        </div>
      </main>
    );
  }

  if (view === "booking") {
    return (
      <main className={styles.createFormLayout}>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <BookingView
          accommodation={selectedAccommodation}
          flight={selectedFlight}
          tripData={tripData}
          onPay={handleConfirmBooking}
          isLoading={isLoading}
          initialTravelers={collaborators.length || 1}
        />
      </main>
    );
  }

  return <div>An unexpected error occurred.</div>;
}
