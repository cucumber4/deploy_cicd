import React, { useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";
import "../pages/CreatePoll.css";
import { TransitionGroup, CSSTransition } from "react-transition-group";

const ProposePoll = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [candidates, setCandidates] = useState(["", ""]);
  const [message, setMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const updated = [...candidates];
    updated[index] = e.target.value;
    setCandidates(updated);
  };

  const addCandidate = () => {
    if (candidates.length < 8) {
      setCandidates([...candidates, ""]);
    } else {
      setMessage("Maximum 8 candidates allowed.");
    }
  };

  const removeCandidate = (index) => {
    if (candidates.length > 2) {
      const updated = candidates.filter((_, i) => i !== index);
      setCandidates(updated);
    } else {
      setMessage("Minimum 2 candidates required.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Error: Not authorized.");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/polls/propose",
        { name, description, candidates },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Proposal submitted successfully!");
      setName("");
      setDescription("");
      setCandidates(["", ""]);
    } catch (error) {
      setMessage("Error submitting proposal: " + (error.response?.data?.detail || "Unknown error"));
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

      <div className="main-content page-centered">
        <div className="poll-form-container">
          <h2 className="poll-form-heading">Propose a Poll</h2>
          <form onSubmit={handleSubmit} className="poll-form">
            <input
              type="text"
              placeholder="Poll Title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="poll-input"
            />

            <textarea
              placeholder="Poll Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="poll-input textarea"
            />

            <TransitionGroup>
              {candidates.map((candidate, index) => {
                const nodeRef = React.createRef();
                return (
                  <CSSTransition key={index} nodeRef={nodeRef} timeout={300} classNames="fade">
                    <div ref={nodeRef} className="candidate-input-group">
                      <input
                        type="text"
                        placeholder={`Candidate ${index + 1}`}
                        value={candidate}
                        onChange={(e) => handleChange(e, index)}
                        required
                        className="poll-input"
                      />
                      {candidates.length > 2 && (
                        <button
                          type="button"
                          className="remove-candidate-btn"
                          onClick={() => removeCandidate(index)}
                        >
                          −
                        </button>
                      )}
                    </div>
                  </CSSTransition>
                );
              })}
            </TransitionGroup>

            {candidates.length < 8 && (
              <button type="button" onClick={addCandidate} className="gradient-button">
                + Add Candidate
              </button>
            )}

            <button type="submit" className="gradient-button">
              Submit Proposal
            </button>
          </form>

          {message && (
            <div>
              <p className="poll-message-box">{message}</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="back-dashboard-btn"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposePoll;
