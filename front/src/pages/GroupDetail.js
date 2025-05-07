import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";
import { FaBars, FaTimes, FaUserMinus } from "react-icons/fa";

const GroupDetail = () => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 768);

  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
  const handleResize = () => {
    setSidebarCollapsed(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);


  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem("token");

      const userRes = await axios.get("http://127.0.0.1:8000/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(userRes.data);

      const groupsRes = await axios.get("http://127.0.0.1:8000/groups/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foundGroup = groupsRes.data.find((g) => g.id == groupId);
      if (!foundGroup) {
        setMessage("Group not found.");
        return;
      }
      setGroupInfo(foundGroup);

      const membersRes = await axios.get(`http://127.0.0.1:8000/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMembers(membersRes.data);

      const isAdmin = membersRes.data.some(
        (m) => m.user_id === userRes.data.id && m.role === "admin"
      );
      setIsGroupAdmin(isAdmin);

      const pollsRes = await axios.get(
        `http://127.0.0.1:8000/polls/group/${groupId}/polls`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPolls(pollsRes.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load group data.");
    }
  };

  const kickMember = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/groups/${groupId}/kick/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setMessage("✅ Member kicked!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.detail || "Failed to kick member"));
    }
  };

  // Filter logic
  const filteredMembers = members.filter((member) =>
    `${member.nickname} ${member.first_name} ${member.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredPolls = polls.filter((poll) =>
    poll.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container montserrat-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="collapse-btn"
      >
        {sidebarCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
      </button>

      <div className="main-content">
        {message && <p style={{ color: "red", marginBottom: "20px" }}>{message}</p>}

        {groupInfo && (
          <>
            <h2 className="dashboard-heading">{groupInfo.name}</h2>
            <p className="poll-description" style={{ marginBottom: "20px" }}>
              {groupInfo.description || "No description provided."}
            </p>

            {/* 🔍 Unified Search Bar */}
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Search group member or poll by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "10px 16px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  maxWidth: "400px",
                  width: "100%",
                }}
              />
            </div>

            <h3 className="dashboard-heading">Group Members</h3>
            <ul className="polls-list">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <li key={member.user_id} className="poll-card">
                    <div className="poll-card-inner">
                      <p className="poll-name">
                        👤 {member.nickname} ({member.first_name} {member.last_name}){" "}
                        {member.role === "admin" ? "(Admin)" : ""}
                      </p>

                      {isGroupAdmin && member.role !== "admin" && (
                        <button
                          className="gradient-button danger"
                          onClick={() => kickMember(member.user_id)}
                        >
                          <FaUserMinus style={{ marginRight: "6px" }} />
                          Kick
                        </button>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p style={{ color: "#888", textAlign: "center" }}>No matching members found.</p>
              )}
            </ul>

            <h3 className="dashboard-heading" style={{ marginTop: "40px" }}>
              Group Polls
            </h3>
            <ul className="polls-list">
              {filteredPolls.length > 0 ? (
                filteredPolls.map((poll) => (
                  <li key={poll.id} className="poll-card">
                    <div className="poll-card-inner">
                      <p
                        className="poll-name"
                        style={{
                          cursor: "pointer",
                          color: "#6e8efb",
                          textDecoration: "underline",
                        }}
                        onClick={() => navigate(`/vote/${poll.id}`)}
                      >
                        {poll.name}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <p style={{ color: "#888", textAlign: "center" }}>No matching polls found.</p>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
