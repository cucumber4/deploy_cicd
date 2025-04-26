// pages/GroupsList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/groups/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to load my groups");
      setMessage("❌ Failed to load groups");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/groups/${groupId}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setMessage("✅ Left the group successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.detail || "Failed to leave group"));
    }
  };

  return (
    <div className="dashboard-container montserrat-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="collapse-btn"
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content">
        <h2 className="dashboard-heading">My Groups</h2>

        {loading ? (
          <p>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p>You are not a member of any group.</p>
        ) : (
          <ul className="polls-list">
            {groups.map((group) => (
              <li key={group.id} className="poll-card">
                <div className="poll-card-inner">
                  <div style={{ flex: 1 }}>
                    <p className="poll-name">{group.name}</p>
                    <p className="poll-description">{group.description}</p>
                  </div>
                  <button
                    className="gradient-button danger"
                    onClick={() => leaveGroup(group.id)}
                  >
                    Leave Group
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default GroupsList;
