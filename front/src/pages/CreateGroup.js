import React, { useState, useEffect } from "react";
import SidebarLayout from "../components/SidebarLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreatePoll.css"; // используем общие стили формы

const CreateGroup = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [groupData, setGroupData] = useState({ name: "", description: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setGroupData({ ...groupData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setMessage("❌ Not authorized.");

    try {
      const res = await axios.post("http://127.0.0.1:8000/groups/create", groupData, {
        headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
      });
      setMessage(`✅ Group created! ID: ${res.data.group_id}`);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.detail || "Failed to create group."));
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

      <div className="main-content page-centered">
        <div className="poll-form-container">
          <h2 className="poll-form-heading">Create a Group</h2>
          <form onSubmit={handleSubmit} className="poll-form">
            <input
              type="text"
              name="name"
              value={groupData.name}
              onChange={handleChange}
              placeholder="Group Name"
              className="poll-input"
              required
            />
            <textarea
              name="description"
              value={groupData.description}
              onChange={handleChange}
              placeholder="Group Description"
              className="poll-input textarea"
              required
            />
            <button type="submit" className="gradient-button">Create Group</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
