import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";
import agaLogo from "../assets/agapinklogo.png";
import axios from "axios";
import {
  FaInfoCircle, FaCoins, FaLightbulb, FaUsers, FaVoteYea,
  FaListAlt, FaHistory, FaChartBar, FaClipboardList,
  FaMoneyCheckAlt, FaTools, FaSignOutAlt
} from "react-icons/fa";

const SidebarLayout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [agaBalance, setAgaBalance] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const handleRequestTokens = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }

            const res = await axios.post("http://127.0.0.1:8000/tokens/request-tokens", {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Request success:", res.data);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 2500);
        } catch (error) {
            console.error("Token request failed:", error.response?.data || error.message);
            alert("Token request failed.");
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("http://127.0.0.1:8000/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);

                const balanceResponse = await axios.get(
                    `http://127.0.0.1:8000/user/balance/${response.data.wallet_address}`
                );
                setAgaBalance(balanceResponse.data.balance);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        fetchUser();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-scroll">
                    <img src={agaLogo} alt="Logo" className="logo" />
                    {user?.avatar_hash ? (
                        <img
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.avatar_hash}`}
                            alt="Avatar"
                            className="user-avatar"
                        />
                    ) : (
                        <div className="user-icon">👤</div>
                    )}

                    <div className="sidebar-links">
                      <div className="sidebar-link" onClick={() => setShowUserInfo(!showUserInfo)}>
                        <FaInfoCircle className="sidebar-icon" />
                        {showUserInfo ? "Hide Info" : "Show Info"}
                      </div>

                        {showUserInfo && user && (
                            <div className="user-info-container show">
                              <div className="user-info">
                                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Wallet:</strong> {user.wallet_address}</p>
                                <p><strong>AGA Balance:</strong> {agaBalance !== null ? `${agaBalance} AGA` : "Loading..."}</p>
                                <p><strong>Role:</strong> {user.role === "admin" ? "Administrator" : "User"}</p>
                              </div>
                            </div>
                          )}

                      {user?.role === "user" && (
                        <>
                          <div className="sidebar-link" onClick={handleRequestTokens}>
                            <FaCoins className="sidebar-icon" />
                            Request 10 AGA
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/propose")}>
                            <FaLightbulb className="sidebar-icon" />
                            Propose Voting
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/groups/create-poll")}>
                            <FaUsers className="sidebar-icon" />
                            Propose Group Poll
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/polls")}>
                            <FaListAlt className="sidebar-icon" />
                            All Votings
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/vote-history")}>
                            <FaHistory className="sidebar-icon" />
                            Voting History
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/results")}>
                            <FaChartBar className="sidebar-icon" />
                            View Results
                          </div>
                        </>
                      )}

                      {user?.role === "admin" && (
                        <>
                          <div className="sidebar-link" onClick={() => navigate("/create-poll")}>
                            <FaVoteYea className="sidebar-icon" />
                            Create a Vote
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/polls")}>
                            <FaListAlt className="sidebar-icon" />
                            All Votings
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/vote-history")}>
                            <FaHistory className="sidebar-icon" />
                            Voting History
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/results")}>
                            <FaChartBar className="sidebar-icon" />
                            View Results
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/proposals")}>
                            <FaClipboardList className="sidebar-icon" />
                            View Proposals
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/token-requests")}>
                            <FaMoneyCheckAlt className="sidebar-icon" />
                            Token Requests
                          </div>
                          <div className="sidebar-link" onClick={() => navigate("/admin")}>
                            <FaTools className="sidebar-icon" />
                            Manage Polls
                          </div>
                        </>
                      )}

                      <div className="sidebar-link" onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                      }}>
                        <FaSignOutAlt className="sidebar-icon" />
                        Logout
                      </div>
                    </div>
                </div>
            </div>

            <div className="main-content">
                {children}
            </div>

            {showNotification && (
                <div className="notification-popup">
                    🎉 Request for 10 AGA has been sent!
                </div>
            )}
        </div>
    );
};

export default SidebarLayout;