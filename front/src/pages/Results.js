import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "../pages/Dashboard.css";
import "./Results.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
        {sidebarCollapsed ? "→" : "←"}
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
              </table>

              <div className="results-card-list">
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
                  <div key={idx} className="results-card">
                    <div
                      onClick={() => toggleExpand(pollName, "name")}
                      className={`results-card-title ${expandedRows[pollName]?.name ? "expanded" : "collapsed"}`}
                      title={!expandedRows[pollName]?.name ? pollName : ""}
                    >
                      {pollName}
                    </div>
                    <div
                      onClick={() => toggleExpand(pollName, "desc")}
                      className={`results-card-desc ${expandedRows[pollName]?.desc ? "expanded" : "collapsed"}`}
                      title={!expandedRows[pollName]?.desc ? pollData.description : ""}
                    >
                      {pollData.description}
                    </div>
                    <div className="results-card-candidates">
                      {pollData.candidates.map((c, i) => (
                        <span key={i}>{c.candidate}</span>
                      ))}
                    </div>
                    <div className="results-card-votes">
                      {pollData.candidates.map((c, i) => (
                        <span key={i}>{c.votes} vote{c.votes !== 1 ? "s" : ""}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
