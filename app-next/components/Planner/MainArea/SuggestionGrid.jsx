import styles from "./MainArea.module.css";
import Card from "../Card/Card";

export default function SuggestionGrid({
  suggestions = [],
  onAddToShortlist,
  onRemoveFromShortlist, // New prop to handle removal
  shortlistedItems = [],
}) {
  // This new handler decides whether to call the 'add' or 'remove' function.
  const handleToggleShortlist = (suggestion) => {
    const shortlistedItem = shortlistedItems.find(
      (item) => item.id === suggestion.id
    );

    if (shortlistedItem) {
      // If the item is already in the shortlist, we call the remove function.
      onRemoveFromShortlist(shortlistedItem);
    } else {
      // Otherwise, we call the add function.
      onAddToShortlist(suggestion);
    }
  };

  // An improved empty state for when no suggestions are available yet.
  if (suggestions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>Your AI suggestions will appear here.</h2>
        <p>
          Use the panel on the left to tell the AI your preferences and get
          personalized recommendations for your trip.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      {suggestions.map((item) => {
        const isSelected = !!shortlistedItems.find((i) => i.id === item.id);

        return (
          <Card
            key={item.id}
            item={item}
            // The onSelect now calls our new toggle handler.
            onSelect={() => handleToggleShortlist(item)}
            isSelected={isSelected}
            // The button text is now dynamic to reflect the item's status.
            buttonText={isSelected ? "✅ Shortlisted" : "❤️ Add to Shortlist"}
          />
        );
      })}
    </div>
  );
}
