import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import { FaVoteYea, FaLock, FaBars, FaTimes } from "react-icons/fa";
import "../pages/Dashboard.css";
import "./PollsList.css";

const PollsList = () => {
  const [polls, setPolls] = useState([]);
  const [message, setMessage] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 768);

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
  const handleResize = () => {
    setSidebarCollapsed(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);


  useEffect(() => {
    async function fetchPolls() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/polls/list/");
        setPolls(response.data);
      } catch (error) {
        console.error("Polls fetch error:", error);
        setMessage("Failed to load polls.");
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    }

    fetchPolls();
  }, []);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const updatedPolls = await Promise.all(
          polls.map(async (poll) => {
            try {
              const statusRes = await axios.get(`http://127.0.0.1:8000/polls/polls/status/${poll.id}`);
              return { ...poll, active: statusRes.data.active };
            } catch (err) {
              console.error(`Error fetching status for poll ${poll.id}:`, err);
              return { ...poll, active: false };
            }
          })
        );

        setPolls(updatedPolls);
      } finally {
        setLoadingStatuses(false);
      }
    }

    if (polls.length > 0) fetchStatuses();
  }, [polls.length]);

  const handlePollClick = (pollId) => {
    navigate(`/vote/${pollId}`);
  };

  const filteredPolls = polls.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container pollslist-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
      </button>

      <div className="main-content pollslist-content">
        <div className="pollslist-box">
          <div className="pollslist-header">
            <h1 className="pollslist-heading">List of Polls</h1>
            <span className="pollslist-count">Total number of polls: {polls.length}</span>
          </div>

          {/* 🔍 Search Bar */}
          <div className="results-search-wrapper" style={{ maxWidth: "800px", marginBottom: "30px" }}>
            <div className="results-search-bar">
              <input
                type="text"
                placeholder="Search polls by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="results-search-input"
              />
            </div>
          </div>

          {loading || loadingStatuses ? (
            <p className="pollslist-loading">Loading polls...</p>
          ) : filteredPolls.length === 0 ? (
            <p className="pollslist-empty">No matching polls found.</p>
          ) : (
            <div className="pollslist-items">
              {filteredPolls.map((poll, index) => {
                const isHover = index === hoveredIndex;
                const isActive = poll.active;

                return (
                  <div
                    key={poll.id}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`pollslist-item ${isHover ? "hovered" : ""}`}
                  >
                    <div className="pollslist-info">
                      <div className="pollslist-name">{poll.name}</div>
                      <div className="pollslist-description">{poll.description}</div>
                    </div>

                    {isActive ? (
                      <button
                        onClick={() => handlePollClick(poll.id)}
                        className="pollslist-button"
                      >
                        <FaVoteYea size={18} />
                      </button>
                    ) : (
                      <div className="pollslist-locked">
                        <FaLock size={20} color="#fff" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {message && <p className="pollslist-error">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default PollsList;
