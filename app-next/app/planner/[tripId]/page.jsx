"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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

const TripBookedView = ({ tripName }) => {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => router.push("/user"), 5000);
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div className={styles.bookedViewContainer}>
      <h2>This Trip Has Been Booked!</h2>
      <p>
        Your plans for <strong>{tripName}</strong> are confirmed.
      </p>
      <p>You can find your booked trips in your user profile.</p>
      <p className={styles.redirectMessage}>Redirecting shortly...</p>
    </div>
  );
};

export default function PlannerPage() {
  const { tripId } = useParams();
  const router = useRouter();
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
  const [allMembers, setAllMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const statePollTimer = useRef(null);
  const planningPhaseRef = useRef(planningPhase);

  useEffect(() => {
    planningPhaseRef.current = planningPhase;
  }, [planningPhase]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const isSoloTrip = allMembers.length <= 1;

  const updatePlanningPhase = useCallback(
    async (newPhase) => {
      if (!isOwner) {
        setError("Only the trip owner can advance the planning stage.");
        return;
      }
      const token = localStorage.getItem("token");
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/state`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ phase: newPhase }),
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update phase");
        }
        setPlanningPhase(newPhase);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, isOwner]
  );

  const fetchTripData = useCallback(
    async (isInitialLoad = false) => {
      if (tripId === "new" || !tripId) {
        setView("create");
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const responses = await Promise.all([
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

        for (const res of responses) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push(`/login?redirect=${window.location.pathname}`);
            return;
          }
          if (!res.ok && res.status !== 404) {
            const errorData = await res.json();
            throw new Error(
              errorData.error ||
                `A data request failed with status ${res.status}`
            );
          }
        }

        const [tripRes, shortlistRes, itineraryRes, chatRes] = responses;

        const tripResult = await tripRes.json();
        const trip = tripResult.data;
        setTripData(trip);

        const ownerStatus = currentUser?.id === trip.owner_id;
        setIsOwner(ownerStatus);

        const { owner, collaborators = [] } = trip;
        const members = owner ? [owner, ...collaborators] : collaborators;
        setAllMembers(
          Array.from(new Map(members.map((m) => [m.id, m])).values())
        );

        if (trip.accommodations && trip.accommodations.length > 0) {
          setSelectedAccommodation(trip.accommodations[0]);
        }
        if (trip.flights && trip.flights.length > 0) {
          setSelectedFlight(trip.flights[0]);
        }

        if (shortlistRes.ok) {
          const shortlistResult = await shortlistRes.json();
          setShortlistedItems(shortlistResult.data);
        }

        if (
          itineraryRes.ok &&
          itineraryRes.headers.get("Content-Length") !== "0"
        ) {
          const itineraryResult = await itineraryRes.json();
          setItinerary(itineraryResult.data);
        } else {
          setItinerary(null);
        }

        if (chatRes.ok) {
          const chatResult = await chatRes.json();
          setMessages(
            chatResult.data.map((msg) => ({
              ...msg,
              user: { first_name: msg.first_name, id: msg.user_id },
            }))
          );
        }

        if (isInitialLoad) {
          setView("planner");
        }
      } catch (error) {
        setError(error.message);
      }
    },
    [tripId, currentUser, router]
  );

  const pollData = useCallback(async () => {
    if (!currentUser || !tripId || tripId === "new") return;

    // First, check the lightweight state endpoint
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/state`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const result = await res.json();

      // If the phase has changed, trigger a full refresh and update the state
      if (planningPhaseRef.current !== result.data.planning_phase) {
        setPlanningPhase(result.data.planning_phase);
        await fetchTripData(true);
      } else {
        // If the phase is the same, just refresh the data silently
        await fetchTripData(false);
      }
    } catch (err) {
      console.error("Data poll failed:", err);
    }
  }, [tripId, fetchTripData, currentUser]);

  useEffect(() => {
    if (tripId === "new") {
      setView("create");
      return;
    }

    if (currentUser && tripId) {
      fetchTripData(true);
      statePollTimer.current = setInterval(pollData, 5000); // Set to 5 seconds
    }

    return () => {
      if (statePollTimer.current) clearInterval(statePollTimer.current);
    };
  }, [currentUser, tripId, fetchTripData, pollData]);

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
      setError(`Failed to create trip: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestions = async (preferenceText) => {
    setError(null);
    if (!isOwner) {
      setError("Only the trip owner can get AI suggestions.");
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
      await updatePlanningPhase("shortlisting");
    } catch (error) {
      setError(
        `Could not get suggestions: ${error.message}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToShortlist = async (attraction) => {
    setError(null);
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
      await fetchTripData();
    } catch (error) {
      setError(`Could not add item to shortlist: ${error.message}.`);
    }
  };

  const handleRemoveFromShortlist = async (itemToRemove) => {
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/shortlist/${itemToRemove.shortlistItemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchTripData();
    } catch (error) {
      setError(`Could not remove item from shortlist: ${error.message}.`);
    }
  };

  const handleVote = async (shortlistItemId) => {
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/shortlist/${shortlistItemId}/vote`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchTripData();
    } catch (error) {
      setError(`Could not process your vote: ${error.message}.`);
    }
  };

  const handleStartVote = () => {
    if (!isOwner) {
      setError("Only the trip owner can start a vote.");
      return;
    }
    if (shortlistedItems.length > 0) {
      updatePlanningPhase("voting");
    } else {
      setError("Please shortlist at least one attraction to start a vote.");
    }
  };

  const handleGenerateItinerary = async () => {
    setError(null);
    if (!isOwner) {
      setError("Only the trip owner can generate the itinerary.");
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
      await updatePlanningPhase("itinerary");
    } catch (error) {
      setError(`Could not generate itinerary: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyItinerary = async (command) => {
    setError(null);
    if (!isOwner) {
      setError("Only the trip owner can modify the itinerary.");
      return;
    }
    if (!itinerary) {
      setError("An itinerary must be generated before it can be modified.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      await fetch(
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
      await fetchTripData();
    } catch (error) {
      setError(`Could not modify itinerary: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAccommodation = async () => {
    setError(null);
    if (!isOwner) {
      setError("Only the trip owner can confirm accommodations.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      await fetch(
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
      await updatePlanningPhase("flights");
    } catch (error) {
      setError(`Could not save your hotel selection: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlight = async () => {
    setError(null);
    if (!isOwner) {
      setError("Only the trip owner can save the flight selection.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      await fetch(
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
      setView("booking");
    } catch (error) {
      setError(`Could not save your flight selection: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToBooking = () => {
    if (!isOwner) {
      setError("Only the trip owner can proceed to booking.");
      return;
    }
    handleSaveFlight();
  };

  const handleConfirmBooking = async (numTravelers) => {
    setError(null);
    if (!isOwner) {
      setError("Only the trip owner can finalize the booking.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      await fetch(
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
      await updatePlanningPhase("booked");
    } catch (error) {
      setError(`There was an error confirming your booking: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageContent) => {
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await fetch(
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
      await fetchTripData();
    } catch (error) {
      setError(`Failed to send message: ${error.message}.`);
    }
  };

  const handleSelectAccommodations = () => {
    if (isOwner) updatePlanningPhase("accommodations");
  };
  const handleSelectFlights = () => {
    if (isOwner) updatePlanningPhase("flights");
  };

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
            onRemoveFromShortlist={handleRemoveFromShortlist}
            shortlistedItems={shortlistedItems}
          />
        );
      case "itinerary":
        return itinerary ? (
          <ItineraryDisplay
            itinerary={itinerary}
            onModifyItinerary={handleModifyItinerary}
            isLoading={isLoading}
            isOwner={isOwner}
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
            isOwner={isOwner}
          />
        );
      case "flights":
        return (
          <FlightDisplay
            flights={mockData.flights}
            onSelectFlight={setSelectedFlight}
            selectedFlight={selectedFlight}
            isOwner={isOwner}
          />
        );
      default:
        return <EmptyState />;
    }
  };

  if (view === "loading") {
    return <div>Loading your trip...</div>;
  }

  if (planningPhase === "booked") {
    return <TripBookedView tripName={tripData?.name} />;
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
          isSoloTrip={isSoloTrip}
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
              isSoloTrip={isSoloTrip}
              isOwner={isOwner}
              currentUser={currentUser}
            />
          </aside>
          <section className={styles.mainAreaContainer}>
            <MainArea isOwner={isOwner} members={allMembers}>
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
          initialTravelers={allMembers.length || 1}
        />
      </main>
    );
  }

  return <div>An unexpected error occurred.</div>;
}
