// pages/BrowseGroups.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FaUserPlus } from "react-icons/fa";

const BrowseGroups = () => {
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/groups/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (error) {
      console.error("Failed to load groups:", error);
    }
  };

  const requestJoin = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/groups/${groupId}/request-join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Request to join sent!");
    } catch (error) {
      console.error(error);
      setMessage(`❌ ${error.response?.data?.detail || "Failed to send join request."}`);
    }
  };

  return (
    <div style={{ width: "100%", marginBottom: "40px" }}>

      {message && (
        <p style={{ marginBottom: "20px", fontWeight: "bold", color: "#6e8efb", textAlign: "center" }}>
          {message}
        </p>
      )}

      <ul className="polls-list" style={{ maxWidth: "900px", margin: "0 auto" }}>
        {groups.map((group) => (
          <li key={group.id} className="poll-card">
            <div className="poll-card-inner">
              <p
                className="poll-name"
                style={{ cursor: "pointer", color: "#6e8efb", textDecoration: "underline" }}
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {group.name}
              </p>
              <button
                className="gradient-button"
                style={{ marginLeft: "12px", display: "flex", alignItems: "center", gap: "8px" }}
                onClick={() => requestJoin(group.id)}
              >
                <FaUserPlus />
                Request to Join
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrowseGroups;
