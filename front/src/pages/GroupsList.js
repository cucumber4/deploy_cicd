// pages/GroupsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";


const GroupsList = () => {
  const [groups, setGroups] = useState([]);
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
    <div style={{ width: "100%", marginBottom: "40px" }}>

      <ul className="polls-list" style={{ maxWidth: "900px", margin: "0 auto" }}>
        {groups.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No groups found.</p>
        ) : (
          groups.map((group) => (
            <li key={group.id} className="poll-card">
              <div className="poll-card-inner">
                <p
                  className="poll-name"
                  style={{
                    cursor: "pointer",
                    color: "#6e8efb",
                    textDecoration: "underline",
                    marginBottom: "8px",
                  }}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  {group.name}
                </p>
                <p className="poll-description">{group.description}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default GroupsList;
