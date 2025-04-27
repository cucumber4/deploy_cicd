import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";

const BrowseGroups = () => {
  const [groups, setGroups] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
    <div className="dashboard-container montserrat-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content">
        <h2 className="dashboard-heading">Browse All Groups</h2>

        {message && <p style={{ marginBottom: "20px", fontWeight: "bold", color: "#6e8efb" }}>{message}</p>}

        <ul className="polls-list">
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
                  style={{ marginLeft: "12px" }}
                  onClick={() => requestJoin(group.id)}
                >
                  ➕ Request to Join
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BrowseGroups;
