import { useState } from "react";
import axios from "axios";

const AddNotification = () => {
  const [message, setMessage] = useState("");

  const sendNotification = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/notification", { message });
      alert("Notification sent!");
      setMessage("");
    } catch (err) {
      alert("Error sending notification");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Notification</h2>

      <textarea
        rows={4}
        placeholder="Enter notification message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
      />

      <button
        onClick={sendNotification}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          borderRadius: 6,
          border: "none",
          backgroundColor: "#2563eb",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Send Notification
      </button>
    </div>
  );
};

export default AddNotification;
