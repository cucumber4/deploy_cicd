import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";

const GroupDetail = () => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem("token");

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

      // Получаем голосования этой группы
const pollsRes = await axios.get(`http://127.0.0.1:8000/polls/group/${groupId}/polls`, {
  headers: { Authorization: `Bearer ${token}` },
});
setPolls(pollsRes.data);


    } catch (error) {
      console.error(error);
      setMessage("Failed to load group data.");
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
        {message && <p style={{ color: "red", marginBottom: "20px" }}>{message}</p>}

        {groupInfo && (
          <>
            <h2 className="dashboard-heading">{groupInfo.name}</h2>
            <p className="poll-description" style={{ marginBottom: "20px" }}>
              {groupInfo.description || "No description provided."}
            </p>

            <h3 className="dashboard-heading">Group Members</h3>
            <ul className="polls-list">
              {members.map((member) => (
                <li key={member.user_id} className="poll-card">
                  <div className="poll-card-inner">
                    <p className="poll-name">
                      👤 {member.nickname} ({member.first_name} {member.last_name}) {member.role === "admin" ? "(Admin)" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <h3 className="dashboard-heading" style={{ marginTop: "40px" }}>Group Polls</h3>
            <ul className="polls-list">
              {polls.length > 0 ? polls.map((poll) => (
                <li key={poll.id} className="poll-card">
                  <div className="poll-card-inner">
                    <p
                      className="poll-name"
                      style={{ cursor: "pointer", color: "#6e8efb", textDecoration: "underline" }}
                      onClick={() => navigate(`/vote/${poll.id}`)}
                    >
                      {poll.name}
                    </p>
                  </div>
                </li>
              )) : (
                <p>No polls created in this group yet.</p>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
