import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
    } catch (error) {
      console.error("Failed to load my groups:", error);
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
        <h2 className="dashboard-heading">My Groups</h2>
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
                <p className="poll-description">{group.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupsList;
