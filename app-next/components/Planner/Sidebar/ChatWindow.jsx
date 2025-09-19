import { useState } from "react";
import styles from "./Sidebar.module.css";
import Button from "../Button/Button";

export default function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  isDeactivated,
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    // Add a class when deactivated for styling
    <div
      className={`${styles.sidebarModule} ${
        isDeactivated ? styles.deactivatedChat : ""
      }`}
    >
      <h3>{isDeactivated ? "Chat" : "Group Chat"}</h3>
      <div className={styles.messageList}>
        {isDeactivated ? (
          <p className={styles.deactivatedMessage}>
            Chat is disabled for solo trips.
          </p>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={styles.message}>
              <strong>{msg.user.first_name}:</strong> {msg.content}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
      <div className={styles.chatInputArea}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isDeactivated ? "Unavailable for solo trips" : "Type a message..."
          }
          disabled={isDeactivated || isLoading}
        />
        <Button onClick={handleSend} disabled={isDeactivated || isLoading}>
          Send
        </Button>
      </div>
    </div>
  );
}
