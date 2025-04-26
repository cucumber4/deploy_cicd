// pages/GroupMembers.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import axios from "axios";
import "./Dashboard.css";

const GroupMembers = () => {
  const { group_id } = useParams();
  const [members, setMembers] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://127.0.0.1:8000/groups/members?group_id=${group_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (err) {
      setMessage("❌ Failed to load group members");
    }
  };

  const kickMember = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/groups/${group_id}/kick/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setMessage("✅ Member kicked!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.detail || "Failed to kick member"));
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
        <h2 className="dashboard-heading">Group Members</h2>

        {members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <ul className="polls-list">
            {members.map((member, index) => (
              <li key={index} className="poll-card">
                <div className="poll-card-inner">
                  <div>
                    <p>User ID: {member.user_id}</p>
                    <p>Role: {member.role}</p>
                  </div>
                  <button
                    className="gradient-button danger"
                    onClick={() => kickMember(member.user_id)}
                  >
                    Kick
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

export default GroupMembers;
