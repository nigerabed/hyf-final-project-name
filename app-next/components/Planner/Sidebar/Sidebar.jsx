import styles from "./Sidebar.module.css";
import PreferenceCollector from "./PreferenceCollector";
import TripShortlist from "./TripShortlist";
import VotingPoll from "./VotingPoll";
import AccommodationSelector from "./AccommodationSelector";
import FlightSelector from "./FlightSelector";
import ChatWindow from "./ChatWindow";
import ItineraryActions from "./ItineraryActions";

export default function Sidebar({
  phase,
  isLoading,
  onGetSuggestions,
  shortlistedItems,
  selectedAccommodation,
  selectedFlight,
  messages,
  onSendMessage,
  onStartVote,
  onVote,
  onGenerateItinerary,
  onSelectAccommodations,
  onSelectFlights,
  onFinalize,
  onGoToBooking,
  isSoloTrip,
  isOwner,
  currentUser,
}) {
  const renderModule = () => {
    switch (phase) {
      case "preferences":
        return (
          <PreferenceCollector
            isLoading={isLoading}
            onGetSuggestions={onGetSuggestions}
          />
        );
      case "shortlisting":
        return (
          <TripShortlist
            items={shortlistedItems}
            onStartVote={onStartVote}
            isSoloTrip={isSoloTrip}
            onGenerateItinerary={onGenerateItinerary}
            isOwner={isOwner}
          />
        );
      case "voting":
        return (
          <>
            <TripShortlist
              items={shortlistedItems}
              onStartVote={onStartVote}
              isSoloTrip={isSoloTrip}
              onGenerateItinerary={onGenerateItinerary}
              isOwner={isOwner}
            />
            <VotingPoll
              items={shortlistedItems}
              onGenerateItinerary={onGenerateItinerary}
              onVote={onVote}
              isOwner={isOwner}
            />
          </>
        );
      case "itinerary":
        return (
          <ItineraryActions
            onSelectAccommodations={onSelectAccommodations}
            isOwner={isOwner}
          />
        );
      case "accommodations":
        return (
          <AccommodationSelector
            selected={selectedAccommodation}
            onSelectFlights={onSelectFlights}
            isOwner={isOwner}
          />
        );
      case "flights":
        return (
          <FlightSelector
            selected={selectedFlight}
            onGoToBooking={onGoToBooking}
            isOwner={isOwner}
          />
        );
      default:
        return null;
    }
  };

  return (
    <aside className={styles.sidebar}>
      {renderModule()}
      <ChatWindow
        messages={messages}
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        isDeactivated={isSoloTrip}
        currentUser={currentUser}
      />
    </aside>
  );
}
