// pages/BrowseGroups.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const BrowseGroups = () => {
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [requestedGroups, setRequestedGroups] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllGroups();
    fetchMyGroups();
    fetchMyJoinRequests();
  }, []);

  const fetchAllGroups = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/groups/all");
      setGroups(res.data);
    } catch (err) {
      setMessage("❌ Failed to load groups");
    }
  };

  const fetchMyGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/groups/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = res.data.map((g) => g.id);
      setJoinedGroups(ids);
    } catch (err) {
      console.error("Failed to load my groups");
    }
  };

  const fetchMyJoinRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/groups/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = res.data.map((r) => r.group_id);
      setRequestedGroups(ids);
    } catch (err) {
      console.error("Failed to load my join requests");
    }
  };

  const requestJoin = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/groups/${groupId}/request-join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequestedGroups((prev) => [...prev, groupId]);
      setMessage("✅ Request sent!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.detail || "Failed to send request"));
    }
  };

  const isRequestedOrJoined = (groupId) => {
    return requestedGroups.includes(groupId) || joinedGroups.includes(groupId);
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
        <h2 className="dashboard-heading">Browse All Groups</h2>

        {groups.length === 0 ? (
          <p>No groups found.</p>
        ) : (
          <ul className="polls-list">
            {groups.map((group) => (
              <li key={group.id} className="poll-card">
                <div className="poll-card-inner">
                  <div style={{ flex: 1 }}>
                    <p className="poll-name">{group.name}</p>
                    <p className="poll-description">{group.description}</p>
                  </div>
                  {isRequestedOrJoined(group.id) ? (
                    <button
                      className="gradient-button"
                      disabled
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    >
                      Requested
                    </button>
                  ) : (
                    <button
                      className="gradient-button"
                      onClick={() => requestJoin(group.id)}
                    >
                      Request to Join
                    </button>
                  )}
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

export default BrowseGroups;
