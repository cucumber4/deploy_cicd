// ProposalsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "../pages/Dashboard.css";
import "../pages/CreatePoll.css";
import "./ProposalsList.css";

const ProposalsList = () => {
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  async function fetchProposals() {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const proposalsRes = await axios.get("http://127.0.0.1:8000/polls/proposals", { headers });

      const now = new Date();
      const filtered = proposalsRes.data.filter((proposal) => {
        if (proposal.approved && proposal.approved_at) {
          const approvedDate = new Date(proposal.approved_at);
          const diff = (now - approvedDate) / (1000 * 60 * 60 * 24);
          return diff <= 1;
        }
        return true;
      });

      setProposals(filtered);
    } catch (error) {
      setMessage("Failed to load proposed polls.");
    }
  }

  async function approvePoll(proposalId) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(`http://127.0.0.1:8000/polls/approve/${proposalId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await axios.post(`http://127.0.0.1:8000/polls/send-to-contract/${proposalId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                approved_by_admin: true,
                approved: true,
                approved_at: new Date().toISOString(),
              }
            : p
        )
      );
    } catch (error) {
      setMessage("Failed to approve or send to contract.");
      console.error(error);
    }
  }

  async function rejectPoll(proposalId) {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/polls/reject/${proposalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
    } catch (error) {
      setMessage("Failed to reject poll.");
    }
  }

  return (
    <div className="dashboard-container proposals-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content proposals-content">
        <div className="proposals-box">
          <h2 className="proposals-heading">Proposed Polls</h2>

          {proposals.length === 0 ? (
            <p className="proposals-empty">No proposals found.</p>
          ) : (
            <table className="proposals-table">
              <thead>
                <tr className="proposals-thead">
                  <th className="proposals-th col-name">Poll Name</th>
                  <th className="proposals-th col-desc">Description</th>
                  <th className="proposals-th col-options">Options</th>
                  <th className="proposals-th col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="proposals-row">
                    <td className="proposals-td">{proposal.name}</td>
                    <td className="proposals-td">{proposal.description || "No description"}</td>
                    <td className="proposals-td">
                      <div className="proposals-options">
                        {proposal.candidates.map((c, i) => (
                          <span key={i}>{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="proposals-td proposals-actions">
                      {!proposal.approved_by_admin ? (
                        <div className="proposals-btn-group">
                          <button
                            className="proposals-btn approve"
                            onClick={() => approvePoll(proposal.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="proposals-btn reject"
                            onClick={() => rejectPoll(proposal.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : proposal.approved ? (
                        <span className="proposals-status approved">In Contract ✅</span>
                      ) : (
                        <span className="proposals-status pending">
                          Pending Approval <span className="dot-animation" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalsList;