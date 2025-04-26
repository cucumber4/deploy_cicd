import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";
import agaLogo from "../assets/agapinklogo.png";
import axios from "axios";

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
                    <div className="user-icon">👤</div>
                    <button className="user-info-button" onClick={() => setShowUserInfo(!showUserInfo)}>
                        {showUserInfo ? "Hide Info" : "Show Info"}
                    </button>

                    <div className={`user-info-container ${showUserInfo ? "show" : ""}`}>
                        {user && (
                            <div className="user-info">
                                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Wallet Address:</strong> {user.wallet_address}</p>
                                <p><strong>AGA Balance:</strong> {agaBalance !== null ? `${agaBalance} AGA` : "Loading..."}</p>
                                <p><strong>Role:</strong> {user.role === "admin" ? "Administrator" : "User"}</p>
                            </div>
                        )}
                    </div>

                    <button className="sidebar-button" onClick={() => navigate("/polls")}>All Votings</button>
                    <button className="sidebar-button" onClick={() => navigate("/results")}>View Results</button>
                    <button className="sidebar-button" onClick={() => navigate("/vote-history")}>Voting History</button>


                    {user?.role === "user" && (
                        <>
                            <button className="sidebar-button" onClick={handleRequestTokens}>Request 10 AGA</button>
                            <button className="sidebar-button" onClick={() => navigate("/propose")}>Propose Voting</button>
                            <button className="sidebar-button" onClick={() => navigate("/groups/create-poll")}>Propose Group Poll</button>
                        </>
                    )}

                    {user?.role === "admin" && (
                        <>
                            <button className="sidebar-button" onClick={() => navigate("/create-poll")}>Create a Vote</button>
                            <button className="sidebar-button" onClick={() => navigate("/proposals")}>View Proposals</button>
                            <button className="sidebar-button" onClick={() => navigate("/token-requests")}>Token Requests</button>
                            <button className="sidebar-button" onClick={() => navigate("/admin")}>Manage Polls</button>
                        </>
                    )}

                    <button className="sidebar-button" onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}>Logout</button>
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
