import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "./TokenRequests.css";

const TokenRequests = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/tokens/token-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
    } catch (error) {
      setMessage("Failed to load token requests.");
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/tokens/approve-request/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
    } catch (error) {
      setMessage("Error approving request.");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/tokens/reject-request/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
    } catch (error) {
      setMessage("Error rejecting request.");
    }
  };

  return (
    <div className="dashboard-container token-requests-container">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout
          user={user}
          agaBalance={agaBalance}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
        />
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="collapse-btn"
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content token-requests-main">
        <div className="token-requests-box">
          <h2 className="token-requests-heading">Token Requests</h2>

          {requests.length === 0 ? (
            <p className="no-requests">No new requests</p>
          ) : (
            <table className="token-requests-table">
              <thead>
                  <tr>
                    <th className="table-cell left">User ID</th>
                    <th className="table-cell center">Username</th>
                    <th className="table-cell right" style={{paddingRight: "97px"}}>Actions</th>
                  </tr>
              </thead>

              <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="token-requests-row">
                      <td className="table-cell left bold">{req.id}</td>
                      <td className="table-cell center">{req.nickname}</td>
                      <td className="table-cell right">
                        <div className="token-requests-actions">
                          <button
                            className="token-requests-btn approve"
                            onClick={() => handleApprove(req.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="token-requests-btn reject"
                            onClick={() => handleReject(req.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

            </table>
          )}

          {message && <p className="token-requests-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default TokenRequests;
