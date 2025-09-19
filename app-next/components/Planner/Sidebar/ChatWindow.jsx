// FILE: components/planner/Sidebar/ChatWindow.jsx

import { useState, useRef, useEffect } from "react";
import sidebarStyles from "./Sidebar.module.css";
import chatStyles from "./ChatWindow.module.css";
import Button from "../Button/Button";

export default function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  isDeactivated,
}) {
  const [message, setMessage] = useState("");
  const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className={sidebarStyles.sidebarModule}>
      <h3>Group Chat</h3>
      <div className={chatStyles.messageList} ref={messageListRef}>
        {isDeactivated ? (
          <div className={chatStyles.deactivatedMessage}>
            Chat is disabled for solo trips.
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={chatStyles.messageItem}>
              <p>
                <strong>{msg.user?.first_name || "Unknown"}:</strong>{" "}
                {msg.content}
              </p>
            </div>
          ))
        ) : (
          <div className={chatStyles.emptyState}>No messages yet.</div>
        )}
      </div>
      <div className={chatStyles.chatInputArea}>
        <textarea
          className={chatStyles.chatTextarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isDeactivated ? "Unavailable for solo trips" : "Type a message..."
          }
          disabled={isDeactivated || isLoading}
          rows="2"
        />
        <Button
          onClick={handleSend}
          disabled={isDeactivated || isLoading || !message.trim()}
        >
          Send Message
        </Button>
      </div>
    </div>
  );
}
