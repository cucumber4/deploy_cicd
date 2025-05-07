// pages/Notifications.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";
import { FaTrash } from "react-icons/fa";

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
    <div style={{ width: "100%", marginBottom: "40px" }}>
      <h2 className="dashboard-heading" style={{ textAlign: "center", marginBottom: "30px" }}>
        Notifications
      </h2>

      {message && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>
          {message}
        </p>
      )}

      {notifications.length > 0 ? (
        <>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button className="gradient-button" onClick={markAllAsRead}>
              Mark All as Read
            </button>
          </div>

          <ul className="polls-list" style={{ maxWidth: "900px", margin: "0 auto" }}>
            {notifications.map((n) => (
              <li key={n.id} className="poll-card">
                <div className="poll-card-inner">
                  <p className="poll-name">{n.title}</p>
                  <p className="poll-description">{n.message}</p>
                  <button
                    className="gradient-button delete-button"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <FaTrash style={{ marginRight: "6px" }} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ textAlign: "center", color: "#666" }}>No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;