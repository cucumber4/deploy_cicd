import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "../pages/Dashboard.css";
import "./VoteHistory.css";

const VoteHistory = () => {
  const [history, setHistory] = useState([]);
  const [polls, setPolls] = useState([]);
  const [onchainPolls, setOnchainPolls] = useState([]);
  const [onchainLoading, setOnchainLoading] = useState(true);
  const [loadingDots, setLoadingDots] = useState(".");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!onchainLoading) return;

    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [onchainLoading]);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [historyRes, pollsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/votes/vote-history", { headers }),
          axios.get("http://127.0.0.1:8000/polls/list/", { headers }),
        ]);

        setHistory(historyRes.data);
        setPolls(pollsRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    const fetchOnchainPolls = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/polls/list/onchain/");
        setOnchainPolls(response.data);
      } catch (err) {
        console.error("Failed to fetch on-chain polls:", err);
      } finally {
        setOnchainLoading(false);
      }
    };

    fetchOnchainPolls();
  }, []);

  return (
    <div className="dashboard-container" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content" style={{ padding: "40px", width: "100%" }}>
        <div className="vote-history-container">
          <h2 className="vote-history-heading">Your Voting History</h2>

          {history.length === 0 ? (
            <p style={{ textAlign: "center" }}>You haven’t participated in any polls yet.</p>
          ) : (
            <table className="vote-history-table">
              <thead>
                <tr style={{ background: "#f4f4f4" }}>
                  <th className="vote-history-thtd">Poll ID</th>
                  <th className="vote-history-thtd">Poll Name</th>
                  <th className="vote-history-thtd">Date</th>
                  <th className="vote-history-thtd">Time</th>
                  <th className="vote-history-thtd">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const poll = polls.find((p) => p.id === entry.poll_id);
                  const name = poll?.name || "Untitled";
                  const date = new Date(entry.timestamp);
                  const matchingPoll = onchainPolls.find((p) => p.id === entry.poll_id);
                  const status = matchingPoll?.active === true
                    ? "Active"
                    : matchingPoll?.active === false
                    ? "Inactive"
                    : "Unknown";

                  return (
                    <tr key={entry.poll_id}>
                      <td className="vote-history-thtd">#{entry.poll_id}</td>
                      <td className="vote-history-thtd">{name}</td>
                      <td className="vote-history-thtd">{date.toLocaleDateString()}</td>
                      <td className="vote-history-thtd">{date.toLocaleTimeString()}</td>
                      <td className="vote-history-thtd">
                        {onchainLoading ? (
                          <span className="vote-history-status-loading">
                            Loading{loadingDots}
                          </span>
                        ) : status === "Active" ? (
                          <span className="vote-history-status-active">Active</span>
                        ) : status === "Inactive" ? (
                          <span className="vote-history-status-inactive">Inactive</span>
                        ) : (
                          <span className="vote-history-status-unknown">Unknown</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoteHistory;