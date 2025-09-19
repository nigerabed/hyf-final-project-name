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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
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
              <strong>{msg.user?.first_name || "Unknown User"}:</strong>{" "}
              {msg.content}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
      <div className={styles.chatInputArea}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isDeactivated ? "Unavailable for solo trips" : "Type a message..."
          }
          disabled={isDeactivated || isLoading}
          rows="1"
        />
        <Button onClick={handleSend} disabled={isDeactivated || isLoading}>
          Send
        </Button>
      </div>
    </div>
  );
}
