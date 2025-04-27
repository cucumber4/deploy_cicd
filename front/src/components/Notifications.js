import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setMessage("Failed to load notifications.");
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="main-content montserrat-font" style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h2 className="dashboard-heading">Notifications</h2>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {notifications.length > 0 ? (
        <>
          <button
            className="gradient-button"
            style={{ marginBottom: "20px" }}
            onClick={markAllAsRead}
          >
            Mark All as Read
          </button>

          <ul className="polls-list">
            {notifications.map((n) => (
              <li key={n.id} className="poll-card">
                <div className="poll-card-inner">
                  <p className="poll-name">{n.title}</p>
                  <p className="poll-description">{n.message}</p>
                  <button
                    className="gradient-button"
                    style={{ backgroundColor: "#ff4d4f", marginTop: "10px" }}
                    onClick={() => deleteNotification(n.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
