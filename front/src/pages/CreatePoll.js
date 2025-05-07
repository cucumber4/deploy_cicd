import React, { useState, useEffect } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/Dashboard.css";
import { FiCopy, FiCheck } from "react-icons/fi";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./CreatePoll.css";
import {FaBars, FaTimes} from "react-icons/fa";

const CreatePoll = () => {
  const [pollData, setPollData] = useState({
    name: "",
    description: "",
    candidates: ["", ""],
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 768);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        return axios.get(`http://127.0.0.1:8000/user/balance/${res.data.wallet_address}`);
      })
      .then((balanceRes) => setAgaBalance(balanceRes.data.balance))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const handleChange = (e, index) => {
    const newCandidates = [...pollData.candidates];
    newCandidates[index] = e.target.value;
    setPollData({ ...pollData, candidates: newCandidates });
  };

  const addCandidate = () => {
    if (pollData.candidates.length < 8) {
      setPollData({ ...pollData, candidates: [...pollData.candidates, ""] });
    } else {
      setMessage("Maximum 8 candidates allowed.");
    }
  };

  const removeCandidate = (index) => {
    if (pollData.candidates.length > 2) {
      const updated = pollData.candidates.filter((_, i) => i !== index);
      setPollData({ ...pollData, candidates: updated });
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

  if (!user?.wallet_address) {
    setMessage("Error: No wallet address found for user.");
    return;
  }

  try {
    const response = await axios.post("http://127.0.0.1:8000/polls/create", {
      ...pollData,
      wallet_address: user.wallet_address, // <-- ДОБАВЬ ЭТО
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    setMessage({
      text: "Poll created successfully!",
      hash: response.data.tx_hash,
    });
  } catch (error) {
    setMessage(
      "Error creating poll: " +
      (error.response?.data?.detail || "Unknown error")
    );
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

      <div className="main-content">
        <div className="poll-form-container">
          <h2 className="poll-form-heading">Create a Poll</h2>
          <form onSubmit={handleSubmit} className="poll-form">
            <input
              type="text"
              placeholder="Poll Title"
              value={pollData.name}
              onChange={(e) => setPollData({ ...pollData, name: e.target.value })}
              required
              className="poll-input"
            />

            <textarea
              placeholder="Poll Description"
              value={pollData.description}
              onChange={(e) => setPollData({ ...pollData, description: e.target.value })}
              required
              className="poll-input textarea"
            />

            <TransitionGroup>
              {pollData.candidates.map((candidate, index) => {
                const nodeRef = React.createRef();
                return (
                  <CSSTransition
                    key={index}
                    nodeRef={nodeRef}
                    timeout={300}
                    classNames="fade"
                  >
                    <div ref={nodeRef} className="candidate-input-group">
                      <input
                        type="text"
                        placeholder={`Candidate ${index + 1}`}
                        value={candidate}
                        onChange={(e) => handleChange(e, index)}
                        required
                        className="poll-input"
                      />
                      {pollData.candidates.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeCandidate(index)}
                          className="remove-candidate-btn"
                        >
                          −
                        </button>
                      )}
                    </div>
                  </CSSTransition>
                );
              })}
            </TransitionGroup>

            {pollData.candidates.length < 8 && (
              <button type="button" onClick={addCandidate} className="gradient-button">
                + Add Candidate
              </button>
            )}

            <button type="submit" className="gradient-button">
              Create Poll
            </button>
          </form>

          {message && typeof message === "object" && (
            <div className="poll-message-box">
              <p><strong>{message.text}</strong></p>
              <div className="poll-hash-box">
                <code className="poll-hash">{message.hash}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(message.hash);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="copy-button"
                  title="Copy to clipboard"
                >
                  {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
                </button>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="back-dashboard-btn"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;