import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleRequestTokens = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post("http://127.0.0.1:8000/tokens/request-tokens", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
    } catch (error) {
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

        const balanceRes = await axios.get(
          `http://127.0.0.1:8000/user/balance/${response.data.wallet_address}`
        );
        setAgaBalance(balanceRes.data.balance);
      } catch (err) {
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

            <div className={`sidebar-link ${location.pathname === "/dashboard" ? "gradient-button" : ""}`} onClick={() => navigate("/dashboard")}> <FaChartBar className="sidebar-icon" /> Dashboard </div>

            {user?.role === "user" && (
              <>
                <div className={`sidebar-link ${location.pathname === "/request-tokens" ? "gradient-button" : ""}`} onClick={handleRequestTokens}> <FaCoins className="sidebar-icon" /> Request 10 AGA </div>
                <div className={`sidebar-link ${location.pathname === "/propose" ? "gradient-button" : ""}`} onClick={() => navigate("/propose")}> <FaLightbulb className="sidebar-icon" /> Propose Voting </div>
                <div className={`sidebar-link ${location.pathname === "/groups/create-poll" ? "gradient-button" : ""}`} onClick={() => navigate("/groups/create-poll")}> <FaUsers className="sidebar-icon" /> Propose Group Poll </div>
                <div className={`sidebar-link ${location.pathname === "/polls" ? "gradient-button" : ""}`} onClick={() => navigate("/polls")}> <FaListAlt className="sidebar-icon" /> All Votings </div>
                <div className={`sidebar-link ${location.pathname === "/vote-history" ? "gradient-button" : ""}`} onClick={() => navigate("/vote-history")}> <FaHistory className="sidebar-icon" /> Voting History </div>
                <div className={`sidebar-link ${location.pathname === "/results" ? "gradient-button" : ""}`} onClick={() => navigate("/results")}> <FaChartBar className="sidebar-icon" /> View Results </div>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <div className={`sidebar-link ${location.pathname === "/create-poll" ? "gradient-button" : ""}`} onClick={() => navigate("/create-poll")}> <FaVoteYea className="sidebar-icon" /> Create a Vote </div>
                <div className={`sidebar-link ${location.pathname === "/polls" ? "gradient-button" : ""}`} onClick={() => navigate("/polls")}> <FaListAlt className="sidebar-icon" /> All Votings </div>
                <div className={`sidebar-link ${location.pathname === "/vote-history" ? "gradient-button" : ""}`} onClick={() => navigate("/vote-history")}> <FaHistory className="sidebar-icon" /> Voting History </div>
                <div className={`sidebar-link ${location.pathname === "/results" ? "gradient-button" : ""}`} onClick={() => navigate("/results")}> <FaChartBar className="sidebar-icon" /> View Results </div>
                <div className={`sidebar-link ${location.pathname === "/proposals" ? "gradient-button" : ""}`} onClick={() => navigate("/proposals")}> <FaClipboardList className="sidebar-icon" /> View Proposals </div>
                <div className={`sidebar-link ${location.pathname === "/token-requests" ? "gradient-button" : ""}`} onClick={() => navigate("/token-requests")}> <FaMoneyCheckAlt className="sidebar-icon" /> Token Requests </div>
                <div className={`sidebar-link ${location.pathname === "/admin" ? "gradient-button" : ""}`} onClick={() => navigate("/admin")}> <FaTools className="sidebar-icon" /> Manage Polls </div>
              </>
            )}

            <div className="sidebar-link" onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}>
              <FaSignOutAlt className="sidebar-icon" /> Logout
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
