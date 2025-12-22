import { useState, useEffect } from "react";
import axios from "axios";

const AddNotification = () => {
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://31.97.233.212:5000/api/notifications/latest");
      const data = res.data.notification || res.data.notifications || [];
      setNotifications(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
    setLoading(false);
  };

  const sendNotification = async () => {
    if (!message.trim()) return alert("Please enter a message");

    try {
      await axios.post("http://31.97.233.212:5000/api/notification", { message });
      alert("Notification sent!");
      setMessage("");
      fetchNotifications();
    } catch (err) {
      alert("Error sending notification");
    }
  };

  // Delete Single Notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://31.97.233.212:5000/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // Delete ALL Notifications
  const deleteAllNotifications = async () => {
    try {
      await axios.delete("http://31.97.233.212:5000/api/notifications");
      setNotifications([]);
    } catch (err) {
      console.error("Delete all error", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

      <h3 style={{ marginTop: 20 }}>Notifications List</h3>

      <button
        onClick={deleteAllNotifications}
        style={{
          marginBottom: 10,
          padding: "8px 15px",
          borderRadius: 6,
          border: "none",
          backgroundColor: "red",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        Delete All
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            style={{ marginBottom: 10, padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
          >
            <p>{n.message}</p>
            <small>{new Date(n.createdAt).toLocaleString()}</small>

            <button
              onClick={() => deleteNotification(n._id)}
              style={{
                marginTop: 5,
                padding: "5px 12px",
                backgroundColor: "#ef4444",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AddNotification;
