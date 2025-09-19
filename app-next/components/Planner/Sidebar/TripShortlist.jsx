import styles from "./Sidebar.module.css";
import Button from "../Button/Button";

// **MODIFIED**: Accept onGenerateItinerary prop
export default function TripShortlist({
  items = [],
  onStartVote,
  isSoloTrip,
  onGenerateItinerary,
}) {
  return (
    <div className={styles.sidebarModule}>
      <h3>Trip Shortlist ({items.length})</h3>
      <ul className={styles.list}>
        {items.length > 0 ? (
          items.map((item) => <li key={item.id}>{item.name}</li>)
        ) : (
          <li>No items shortlisted.</li>
        )}
      </ul>
      {/* **MODIFIED**: Show the correct button based on whether it's a solo trip */}
      {isSoloTrip ? (
        <Button onClick={onGenerateItinerary} disabled={items.length === 0}>
          Generate Itinerary
        </Button>
      ) : (
        <Button onClick={onStartVote} disabled={items.length === 0}>
          Start Vote
        </Button>
      )}
    </div>
  );
}
