import { useState } from "react";
import { useParams } from "next/navigation";
import styles from "./InviteMembers.module.css"; // Assuming a CSS module exists
import Button from "../Button/Button";

export default function InviteMembers() {
  const { tripId } = useParams();
  const [feedback, setFeedback] = useState("");

  const handleCopyLink = async () => {
    setFeedback("Generating link...");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/invite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // **MODIFIED**: Better error handling
      if (!response.ok) {
        // Try to parse a specific error message from the backend JSON response
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error || "Failed to create invite link. Please try again.";
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const { shareableLink } = result;

      // Use the modern, secure Clipboard API
      await navigator.clipboard.writeText(shareableLink);
      setFeedback("✅ Link copied to clipboard!");

      // Clear the feedback message after a few seconds
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      console.error("Error creating invite link:", error);
      // Display the specific error message
      setFeedback(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.inviteModule}>
      <h3 className={styles.title}>Invite Others</h3>
      <p className={styles.description}>
        Share this link to invite friends to plan with you.
      </p>
      <Button onClick={handleCopyLink}>
        {feedback ? "..." : "Copy Invite Link"}
      </Button>
      {feedback && <p className={styles.feedback}>{feedback}</p>}
    </div>
  );
}
