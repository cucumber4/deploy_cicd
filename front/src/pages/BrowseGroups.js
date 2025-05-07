// pages/BrowseGroups.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const BrowseGroups = () => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [groupsRes, myGroupsRes, myRequestsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/groups/all", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://127.0.0.1:8000/groups/my", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://127.0.0.1:8000/groups/my-requests", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setGroups(groupsRes.data);
      setMyGroups(myGroupsRes.data);
      setMyRequests(myRequestsRes.data);
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
      fetchData(); // обновить данные после отправки запроса
    } catch (error) {
      console.error(error);
      setMessage(`❌ ${error.response?.data?.detail || "Failed to send join request."}`);
    }
  };

  const isMyGroup = (groupId) => {
    return myGroups.some((g) => g.id === groupId);
  };

  const hasRequested = (groupId) => {
    return myRequests.some((r) => r.group_id === groupId);
  };

  return (
    <div style={{ width: "100%", marginBottom: "40px" }}>
      <h2 className="dashboard-heading" style={{ textAlign: "center", marginBottom: "30px" }}>
        Browse All Groups
      </h2>

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

              {isMyGroup(group.id) ? (
                <span style={{ marginLeft: "12px", color: "green", fontWeight: "bold" }}>✅ Member</span>
              ) : hasRequested(group.id) ? (
                <span style={{ marginLeft: "12px", color: "orange", fontWeight: "bold" }}>⏳ Request Sent</span>
              ) : (
                <button
                  className="gradient-button"
                  style={{ marginLeft: "12px" }}
                  onClick={() => requestJoin(group.id)}
                >
                  ➕ Request to Join
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrowseGroups;
