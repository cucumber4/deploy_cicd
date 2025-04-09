import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";


const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [agaBalance, setAgaBalance] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [polls, setPolls] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const filteredPolls = polls.filter(poll =>
        poll.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const activePolls = filteredPolls.filter((p) => p.active);
    const inactivePolls = filteredPolls.filter((p) => !p.active);

    useEffect(() => {
        fetchPolls();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get("/api/user/me", {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setUser(response.data);

                const balanceResponse = await axios.get(`/api/user/balance/${response.data.wallet_address}`);
                setAgaBalance(balanceResponse.data.balance);
            } catch (error) {
                console.error("Error loading user:", error);
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        fetchUserData();
    }, [navigate]);

    const chartData = [
      { name: "Active Polls", value: activePolls.length },
      { name: "Inactive Polls", value: inactivePolls.length },
    ];


    async function fetchPolls() {
        try {
            const response = await axios.get("/api/polls/list/onchain/");
            setPolls(response.data);
        } catch (error) {
            console.error("Error loading polls:", error);
            setMessage("Error loading polls.");
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    }

    async function togglePollStatus(pollId, isActive) {
      const endpoint = isActive
        ? `/api/polls/close/${pollId}`
        : `/api/polls/open/${pollId}`;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(endpoint, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const translated =
          response.data.message === "Голосование закрыто"
            ? "Voting has been closed"
            : response.data.message === "Голосование открыто"
            ? "Voting has been opened"
            : response.data.message;

        setMessage({
          text: translated,
          gradient: isActive
            ? "linear-gradient(90deg, #ff758c, #ff7eb3)"  // Deactivation
            : "linear-gradient(90deg, #6e8efb, #a777e3)", // Activation
        });

        // Re-fetch data after short delay to ensure backend has updated
        setTimeout(() => {
          fetchPolls();
        }, 300);

        // Hide message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage({
          text: "Error changing poll status.",
          gradient: "linear-gradient(90deg, #f44336, #e57373)",
          textColor: "#fff"
        });
        setTimeout(() => setMessage(""), 3000);
      }
    }




    const headingStyle = {
        fontSize: "30px",
        fontWeight: 600,
        marginBottom: "25px",
        background: "linear-gradient(90deg, #6e8efb, #a777e3)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    };

    const pollCardStyle = {
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

    const getMessageStyle = () => ({
      marginTop: "25px",
      textAlign: "center",
      fontSize: "30px",
      fontWeight: "bold",
      background: message.gradient,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    });


    return (
        <div className="dashboard-container">
            <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                <SidebarLayout
                    user={user}
                    agaBalance={agaBalance}
                    showUserInfo={showUserInfo}
                    setShowUserInfo={setShowUserInfo}
                    handleRequestTokens={() => {}}
                />
            </div>

            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="collapse-btn"
            >
                {sidebarCollapsed ? "→" : "←"}
            </button>

            <div className="main-content">

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by poll name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Bar Chart showing active vs inactive */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: sidebarCollapsed ? 1100 : 800, // 📏 Longer if collapsed
                    height: 250,
                    marginBottom: "40px",
                    transition: "max-width 0.3s ease",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={chartData}
                      margin={{ top: 20, right: 50, left: 20, bottom: 10 }}
                      barSize={45}
                    >
                      <defs>
                          <linearGradient id="activeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6e8efb" />
                            <stop offset="100%" stopColor="#a777e3" />
                          </linearGradient>
                          <linearGradient id="inactiveGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ff758c" />
                            <stop offset="100%" stopColor="#ff7eb3" />
                          </linearGradient>
                      </defs>


                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#000" tick={{ fill: "#000", fontWeight: "bold" }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#000", fontSize: 16, fontWeight: "bold" }}
                      />
                      <Tooltip
                        contentStyle={{
                          fontWeight: "bold",
                          background: "#fff",
                          border: "1px solid #ccc",
                          color: "#000",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        animationDuration={1000}
                        radius={[0, 12, 12, 0]}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Active Polls"
                                ? "url(#activeGradient)"
                                : "url(#inactiveGradient)"
                            }
                          />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="right"
                          style={{ fill: "#000", fontWeight: "bold", fontSize: 16 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>


                {/* Lists Side-by-side */}
                <div style={{ display: "flex", gap: "60px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 22 }}>Inactive Polls</h3>
                        <ul className="polls-list">
                            {inactivePolls.map((poll) => (
                                <li key={poll.id} style={pollCardStyle}>
                                    <div>
                                        <strong>{poll.name}</strong>
                                        <span className="inactive"> — Inactive ❌</span>
                                    </div>
                                    <button
                                      className="gradient-button"
                                      style={{
                                        padding: "10px 14px",
                                        fontWeight: 600,
                                        borderRadius: "6px"
                                      }}
                                      onClick={() => togglePollStatus(poll.id, poll.active)}
                                    >
                                      Activate
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 22 }}>Active Polls</h3>
                        <ul className="polls-list">
                            {activePolls.map((poll) => (
                                <li key={poll.id} style={pollCardStyle}>
                                    <div>
                                        <strong>{poll.name}</strong>
                                        <span className="active"> — Active ✅</span>
                                    </div>
                                    <button
                                      className="gradient-button"
                                      style={{
                                        padding: "10px 14px",
                                        fontWeight: 600,
                                        borderRadius: "6px",
                                        background: "linear-gradient(90deg, #ff758c, #ff7eb3)",
                                        color: "white"
                                      }}
                                      onClick={() => togglePollStatus(poll.id, poll.active)}
                                    >
                                      Deactivate
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {message && typeof message === "object" && message.text && (
                  <p style={getMessageStyle()}>{message.text}</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
