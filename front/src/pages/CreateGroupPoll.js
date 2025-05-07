// pages/CreateGroupPoll.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {FaBars, FaTimes} from "react-icons/fa";

const CreateGroupPoll = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    candidates: ["", ""],
    group_id: "",
  });
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
    } catch (error) {
      setMessage("❌ Failed to load groups");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCandidateChange = (e, index) => {
    const updated = [...formData.candidates];
    updated[index] = e.target.value;
    setFormData({ ...formData, candidates: updated });
  };

  const addCandidate = () => {
    if (formData.candidates.length < 8) {
      setFormData({ ...formData, candidates: [...formData.candidates, ""] });
    } else {
      setMessage("Maximum 8 candidates allowed.");
    }
  };

  const removeCandidate = (index) => {
    if (formData.candidates.length > 2) {
      const updated = [...formData.candidates];
      updated.splice(index, 1);
      setFormData({ ...formData, candidates: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setMessage("❌ Not authorized.");

    try {
      await axios.post("http://127.0.0.1:8000/groups/group/created", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setMessage("✅ Group poll created!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.detail || "Failed to create group poll."));
    }
  };

  return (
    <div className="dashboard-container montserrat-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
      </button>


      <div className="main-content page-centered">
        <div className="poll-form-container">
          <h2 className="poll-form-heading">Create Group Poll</h2>
          <form onSubmit={handleSubmit} className="poll-form">
            <select
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              className="poll-input"
              required
            >
              <option value="">Select Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Poll Name"
              className="poll-input"
              required
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Poll Description"
              className="poll-input textarea"
              required
            />

            <h4>Candidates</h4>
            {formData.candidates.map((candidate, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  value={candidate}
                  onChange={(e) => handleCandidateChange(e, index)}
                  placeholder={`Candidate ${index + 1}`}
                  className="poll-input"
                  required
                />
                {formData.candidates.length > 2 && (
                  <button
                      type="button"
                      onClick={() => removeCandidate(index)}
                      className="remove-candidate-btn"
                  >
                    −
                  </button>
                )}
              </div>
            ))}

            {formData.candidates.length < 8 && (
              <button
                type="button"
                onClick={addCandidate}
                className="gradient-button"
                style={{ marginBottom: "20px" }}
              >
                + Add Candidate
              </button>
            )}

            <button type="submit" className="gradient-button">Create Group Poll</button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPoll;