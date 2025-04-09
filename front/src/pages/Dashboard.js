import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  ResponsiveContainer,
  BarChart,
  Bar,
  Axis,
} from "recharts";
import { FaVoteYea } from "react-icons/fa";
import { FaChartPie, FaUsers, FaPoll, FaInfoCircle } from "react-icons/fa";
import { PieChart, Pie, Cell } from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [polls, setPolls] = useState([]);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [latestPolls, setLatestPolls] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const [mostVotedPoll, setMostVotedPoll] = useState(null);

useEffect(() => {
  const fetchMostVoted = async () => {
    try {
      const response = await axios.get("/api/polls/list/onchain/active");
      const sorted = [...response.data].sort((a, b) => b.vote_count - a.vote_count);
      setMostVotedPoll(sorted[0]); // 🎯 top voted
    } catch (error) {
      console.error("Failed to fetch most voted:", error);
    }
  };
  fetchMostVoted();
}, []);

  const headingStyle = {
    fontSize: "30px",
    fontWeight: 600,
    marginBottom: "15px",
    color: "#333",
  };

  const pollCardStyle = {
    background: "#fff",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    color: "#333",
  };

  const dummyData = [
    { date: "Apr 1", votes: 5 },
    { date: "Apr 2", votes: 8 },
    { date: "Apr 3", votes: 2 },
    { date: "Apr 4", votes: 9 },
    { date: "Apr 5", votes: 4 },
  ];

  const statsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginLeft: "40px",
    // width: "1px",
  };


  const cardStyle = (color) => ({
    background: color,
    borderRadius: "12px",
    color: "#fff",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "350px", // Wider
  });

  const pieData = [
    { name: "Participation", value: 64 },
    { name: "Remaining", value: 36 },
  ];

  const COLORS = ["#a777e3", "#eee"];

  const StatisticsChart = () => (
    <div style={{ width: "100%", maxHeight: "300px", marginTop: "40px" }}>
      <h3 style={headingStyle}>
        Ballots Submitted By Date
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={dummyData}>
          <defs>
            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6e8efb" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#a777e3" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#555"
            tick={{ fontWeight: "bold", fontSize: 12 }}
          />
          <YAxis
            stroke="#555"
            tick={{ fontWeight: "bold", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ fontWeight: "bold", fontSize: 13 }}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Area
            type="monotone"
            dataKey="votes"
            stroke="#6e8efb"
            strokeWidth={2}
            fill="url(#colorVotes)"
            dot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const RightStatsPanel = () => (
    <div style={statsStyle}>
      {/* Participation Card with Pie Chart */}
      <div style={cardStyle("#a777e3")}>
        <div>
          <p style={{ fontWeight: "bold", fontSize: 20, color: "#fff" }}>Participation</p>
          <p style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>64%</p>
        </div>
        <PieChart width={120} height={120}>
          <defs>
            <linearGradient id="pieGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6e8efb" />
              <stop offset="100%" stopColor="#a777e3" />
            </linearGradient>
          </defs>
          <Pie
            data={pieData}
            innerRadius={40}
            outerRadius={50}
            dataKey="value"
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "url(#pieGradient)" : "#eee"}
              />
            ))}
          </Pie>
        </PieChart>

      </div>

      {/* Total Users */}
      <div style={cardStyle("#f06292")}>
        <div>
          <p style={{ fontWeight: "bold", fontSize: 20 , color: "white"}}>Total number of voters</p>
          <p style={{ fontSize: 24, fontWeight: "bold", color: "white"}}>1,961</p>
        </div>
        <FaUsers size={32} />
      </div>

      {/* Total Polls */}
      <div style={cardStyle("#64b5f6")}>
        <div>
          <p style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>Total number of created polls</p>
          <p style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>58</p>
        </div>
        <FaPoll size={32} />
      </div>

    </div>
  );


  useEffect(() => {
    async function fetchLatestPolls() {
      try {
        const response = await axios.get("/api/polls/list/onchain/active");
        const latest = response.data.slice(0, 5);
        setLatestPolls(latest);
      } catch (error) {
        console.error("Error fetching latest polls:", error);
      }
    }
    fetchLatestPolls();
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
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        const balanceResponse = await axios.get(
          `http://127.0.0.1:8000/user/balance/${response.data.wallet_address}`
        );
        setAgaBalance(balanceResponse.data.balance);
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchActive(false);
      setPolls([]);
      setMessage("");
    }
  }, [searchTerm]);

  useEffect(() => {
  const fetchSearchResults = async () => {
    if (!searchTerm.trim()) {
      setSearchActive(false);
      setPolls([]);
      setMessage("");
      return;
    }

    try {
      const response = await axios.get(`/api/polls/search?name=${encodeURIComponent(searchTerm)}`);
      setPolls(response.data);
      setSearchActive(true);
    } catch (error) {
      setPolls([]);
      setSearchActive(true);
      if (error.response?.status === 404) {
        setMessage("Poll not found.");
      } else {
        setMessage("Search error.");
      }
    }
  };

  const debounceTimeout = setTimeout(fetchSearchResults, 300); // debounce by 300ms

  return () => clearTimeout(debounceTimeout); // cleanup
}, [searchTerm]);


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage("Enter a voting name!");
      return;
    }
    setLoading(true);
    setSearchActive(true);
    setMessage("");
    try {
      const response = await axios.get(`/api/polls/search?name=${encodeURIComponent(searchTerm)}`);
      setPolls(response.data);
    } catch (error) {
      setPolls([]);
      if (error.response?.status === 404) {
        setMessage("Poll not found.");
      } else {
        setMessage("Search error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTokens = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/tokens/request-tokens", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Token request failed.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout
          user={user}
          agaBalance={agaBalance}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
          handleRequestTokens={handleRequestTokens}
        />
      </div>


  <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
    {sidebarCollapsed ? "→" : "←"}
  </button>

      <div className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter voting name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
          <button className="gradient-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {searchActive && polls.length > 0 && (
          <div style={{ marginBottom: "30px", maxWidth: "600px" }}>
            <h3 style={headingStyle}>Search Results</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {polls.map((poll) => (
                <li key={poll.id} style={pollCardStyle}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <p style={{ fontSize: "18px", fontWeight: "600", color: "#000", margin: 0 }}>
                      {poll.name}
                    </p>
                    <p style={{ fontSize: "px", fontWeight: "600", color: "#000", margin: 0 }}>
                      {poll.description}
                    </p>
                    <button
                      className="gradient-button"
                      style={{ display: "flex", alignItems: "center", padding: "10px 14px" }}
                      onClick={() => navigate(`/vote/${poll.id}`)}
                    >
                      <FaVoteYea size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <StatisticsChart />

{latestPolls.length > 0 && (
<div
  style={{
    display: "grid",
    gridTemplateColumns: sidebarCollapsed
      ? "1fr 1fr 0.7fr"
      : "1fr 1fr", // hide the most voted
    gap: "70px", // nice spacing but not oversized
    alignItems: "flex-start",
    marginTop: "30px",
    width: "100%",
    paddingRight: sidebarCollapsed ? "0px" : "0", // prevent overflow on right
    boxSizing: "border-box",
  }}
>
    {/* LEFT - Active Polls */}
    <div style={{ minWidth: "350px" }}>
      <h3 style={headingStyle}>Recent Active Polls</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {latestPolls.map((poll) => (
          <li
            key={poll.id}
            style={{
              ...pollCardStyle,
              marginBottom: "20px", // ✅ More space between cards
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#000",
                  margin: 0,
                }}
              >
                {poll.name}
              </p>
              <button
                className="gradient-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 14px",
                }}
                onClick={() => navigate(`/vote/${poll.id}`)}
              >
                <FaVoteYea size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* CENTER - Stats Panel */}
<div >

      <h3 style={{ ...headingStyle, marginLeft: "35px" }}>Our Current Statistics</h3>
      <RightStatsPanel />
    </div>

    {/* RIGHT - Fun UI Element (optional decoration / widget) */}
{sidebarCollapsed && mostVotedPoll && (
  <div
    style={{
      minWidth: "220px",
      maxWidth: "300px",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch", // 🧩 important for stacking
      gap: "20px", // 🧼 space between poll card & button
      marginTop: "70px",
    }}
  >
    {/* Most Voted Card */}
    <div
      style={{
        background: "linear-gradient(135deg, #f3e5f5, #e1bee7)",
        borderRadius: "16px",
        padding: "20px",
        color: "#4a148c",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        cursor: "pointer",
        animation: "fadeInSlide 0.6s ease-out",
      }}
      onClick={() => navigate(`/vote/${mostVotedPoll.id}`)}
    >
      <h3 style={{ marginBottom: "8px", fontWeight: "bold", fontSize: "18px", color: "#4a148c" }}>
        🏆 Most Voted Poll
      </h3>
      <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "16px" }}>
        {mostVotedPoll.name}
      </p>

      <ResponsiveContainer width="100%" height={60}>
        <BarChart
          data={[{ name: mostVotedPoll.name, votes: mostVotedPoll.vote_count }]}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <Tooltip />
          <Bar
            dataKey="votes"
            fill="url(#barGradient)"
            radius={[0, 10, 10, 0]}
            animationDuration={1200}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6e8efb" />
              <stop offset="100%" stopColor="#a777e3" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      <p style={{ marginTop: "10px", fontSize: "14px", fontWeight: "bold" }}>
        Total Votes: {mostVotedPoll.vote_count}
      </p>
    </div>

    {/* Learn More Button on Right Side */}
    <div
      style={{
        background: "linear-gradient(90deg, #6e8efb, #a777e3)",
        borderRadius: "12px",
        padding: "14px 20px",
        color: "white",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "pointer",
      }}
      onClick={() => navigate("/")}
    >
      <FaInfoCircle size={20} style={{ marginRight: "10px" }} />
      Learn More
    </div>
  </div>
)}

  </div>
)}


            </div>

          </div>
    );
};

export default Dashboard;
