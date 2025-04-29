// pages/GroupJoinRequests.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const GroupJoinRequests = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/groups/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      setMessage("❌ Failed to load groups");
    }
  };

  const fetchRequests = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://127.0.0.1:8000/groups/${groupId}/join-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
      setSelectedGroupId(groupId);
    } catch (err) {
      setMessage("❌ Failed to load join requests");
    }
  };

  const acceptRequest = async (groupId, requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/groups/${groupId}/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests(groupId);
    } catch (err) {
      setMessage("❌ Failed to accept request");
    }
  };

  return (
    <div style={{ width: "100%", marginBottom: "40px" }}>
      <h2 className="dashboard-heading" style={{ textAlign: "center", marginBottom: "30px" }}>
        Group Join Requests
      </h2>

      <div className="search-container" style={{ marginBottom: "30px", maxWidth: "600px", margin: "0 auto 30px" }}>
        <select
          onChange={(e) => fetchRequests(e.target.value)}
          className="input-field"
          defaultValue=""
        >
          <option value="" disabled>
            Select a group
          </option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {requests.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>No join requests found.</p>
      ) : (
        <ul className="polls-list" style={{ maxWidth: "900px", margin: "0 auto" }}>
          {requests.map((req) => (
            <li key={req.request_id} className="poll-card">
              <div className="poll-card-inner">
                <p className="poll-name">User ID: {req.user_id}</p>
                <button
                  className="gradient-button"
                  onClick={() => acceptRequest(selectedGroupId, req.request_id)}
                >
                  Accept
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p style={{ textAlign: "center", marginTop: "20px", fontWeight: "bold", color: "#e53935" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default GroupJoinRequests;
