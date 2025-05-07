import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "../pages/Dashboard.css";
import "./Results.css";
import {FaBars, FaTimes} from "react-icons/fa";

const Results = () => {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 768);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (pollName, type) => {
    setExpandedRows((prev) => ({
      ...prev,
      [pollName]: {
        ...prev[pollName],
        [type]: !prev[pollName]?.[type],
      },
    }));
  };

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
    const fetchResults = async () => {
      try {
        const pollsRes = await axios.get("http://127.0.0.1:8000/polls/list/");
        const polls = pollsRes.data;
        const voteData = [];

        for (const poll of polls) {
          for (const candidate of poll.candidates) {
            try {
              const voteRes = await axios.get(`http://127.0.0.1:8000/votes/${poll.id}/${candidate}`);
              voteData.push({
                poll: poll.name,
                description: poll.description,
                candidate,
                votes: voteRes.data.votes || 0,
              });
            } catch {
              voteData.push({
                poll: poll.name,
                description: poll.description,
                candidate,
                votes: 0,
              });
            }
          }
        }

        setResults(voteData);
      } catch (err) {
        setError("Failed to load results.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = results.filter((r) =>
    r.poll.toLowerCase().includes(search.toLowerCase()) ||
    r.candidate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container results-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
      </button>

      <div className="main-content results-content">
        <div className="results-box">
          <div className="results-heading">Voting Results</div>

          <div className="results-search-wrapper">
            <div className="results-search-bar">
              <input
                type="text"
                placeholder="Search polls or candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="results-search-input"
              />
            </div>
          </div>

          {loading ? (
            <p className="results-loading">Loading results...</p>
          ) : error ? (
            <p className="results-error">{error}</p>
          ) : (
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Poll Name</th>
                    <th>Description</th>
                    <th>Candidates</th>
                    <th>Results</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    filteredResults.reduce((acc, curr) => {
                      if (!acc[curr.poll]) {
                        acc[curr.poll] = {
                          description: curr.description,
                          candidates: [],
                        };
                      }
                      acc[curr.poll].candidates.push({ candidate: curr.candidate, votes: curr.votes });
                      return acc;
                    }, {})
                  ).map(([pollName, pollData], idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="results-card-title">{pollName}</div>
                      </td>
                      <td>{pollData.description}</td>
                      <td>
                        {pollData.candidates.map((c, i) => (
                          <div key={i}>{c.candidate}</div>
                        ))}
                      </td>
                      <td>
                        {pollData.candidates.map((c, i) => (
                          <div key={i}>{c.votes} vote{c.votes !== 1 ? "s" : ""}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;