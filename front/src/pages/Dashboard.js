// Dashboard.js
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
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { FaVoteYea, FaChartPie, FaUsers, FaPoll, FaInfoCircle } from "react-icons/fa";
import { PieChart, Pie } from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [polls, setPolls] = useState([]);
  const [message, setMessage] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [latestPolls, setLatestPolls] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mostVotedPoll, setMostVotedPoll] = useState(null);
  const [allOpenPolls, setAllOpenPolls] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpenPolls = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/polls/list/onchain/active");
        setAllOpenPolls(response.data);
        setLatestPolls(response.data.slice(0, 5));

        const sorted = [...response.data].sort((a, b) => b.vote_count - a.vote_count);
        setMostVotedPoll(sorted[0]);
      } catch (error) {
        console.error("Failed to fetch open polls:", error);
      }
    };
    fetchOpenPolls();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchActive(false);
      setPolls([]);
      return;
    }
    const filtered = allOpenPolls.filter(poll =>
      poll.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setPolls(filtered);
    setSearchActive(true);
  }, [searchTerm, allOpenPolls]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchActive(false);
      setPolls([]);
      setMessage("");
    }
  }, [searchTerm]);

  const dummyData = [
    { date: "Apr 1", votes: 5 },
    { date: "Apr 2", votes: 8 },
    { date: "Apr 3", votes: 2 },
    { date: "Apr 4", votes: 9 },
    { date: "Apr 5", votes: 4 },
  ];

  const pieData = [
    { name: "Participation", value: 64 },
    { name: "Remaining", value: 36 },
  ];

  const COLORS = ["#a777e3", "#eee"];

  const StatisticsChart = () => (
    <div className="chart-container">
      <h3 className="dashboard-heading">Ballots Submitted By Date</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={dummyData}>
          <defs>
            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6e8efb" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#a777e3" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#555" tick={{ fontWeight: "bold", fontSize: 12 }} />
          <YAxis stroke="#555" tick={{ fontWeight: "bold", fontSize: 12 }} />
          <Tooltip contentStyle={{ fontWeight: "bold", fontSize: 13 }} labelStyle={{ fontWeight: "bold" }} />
          <Area type="monotone" dataKey="votes" stroke="#6e8efb" strokeWidth={2} fill="url(#colorVotes)" dot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const RightStatsPanel = () => (
    <div className="stats-panel">
      <div className="stats-card purple">
        <div>
          <p className="stats-title">Participation</p>
          <p className="stats-value">64%</p>
        </div>
        <PieChart width={120} height={120}>
          <defs>
            <linearGradient id="pieGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6e8efb" />
              <stop offset="100%" stopColor="#a777e3" />
            </linearGradient>
          </defs>
          <Pie data={pieData} innerRadius={40} outerRadius={50} dataKey="value">
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? "url(#pieGradient)" : "#eee"} />
            ))}
          </Pie>
        </PieChart>
      </div>

      <div className="stats-card pink">
        <div>
          <p className="stats-title">Total number of voters</p>
          <p className="stats-value">1,961</p>
        </div>
        <FaUsers size={32} />
      </div>

      <div className="stats-card blue">
        <div>
          <p className="stats-title">Total number of created polls</p>
          <p className="stats-value">58</p>
        </div>
        <FaPoll size={32} />
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
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
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
  <button className="gradient-button" onClick={() => navigate("/groups/create")}>
    ➕ Create Group
  </button>
  <button className="gradient-button" onClick={() => navigate("/groups/list")}>
    📃 My Groups
  </button>
  <button className="gradient-button" onClick={() => navigate("/groups/requests")}>
    📨 Join Requests
  </button>
  <button className="gradient-button" onClick={() => navigate("/groups/browse")}>
    🔍 Browse All Groups
  </button>
</div>



        {searchActive && polls.length > 0 && (
          <div className="search-results">
            <h3 className="dashboard-heading">Search Results</h3>
            <ul className="polls-list">
              {polls.map((poll) => (
                <li key={poll.id} className="poll-card">
                  <div className="poll-card-inner">
                    <p className="poll-name">{poll.name}</p>
                    <p className="poll-description">{poll.description}</p>
                    <button
                      className="gradient-button"
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
          <div className={`dashboard-grid ${sidebarCollapsed ? "collapsed-grid" : ""}`}>
            <div className="recent-polls">
              <h3 className="dashboard-heading">Recent Active Polls</h3>
              <ul className="polls-list">
                {latestPolls.map((poll) => (
                  <li key={poll.id} className="poll-card">
                    <div className="poll-card-inner">
                      <p className="poll-name">{poll.name}</p>
                      <button
                        className="gradient-button"
                        onClick={() => navigate(`/vote/${poll.id}`)}
                      >
                        <FaVoteYea size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stats-wrapper">
              <h3 className="dashboard-heading">Our Current Statistics</h3>
              <RightStatsPanel />
            </div>

            {sidebarCollapsed && mostVotedPoll && (
              <div className="most-voted-card" onClick={() => navigate(`/vote/${mostVotedPoll.id}`)}>
                <h3>🏆 Most Voted Poll</h3>
                <p>{mostVotedPoll.name}</p>
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
                <p>Total Votes: {mostVotedPoll.vote_count}</p>
                <div className="learn-more" onClick={() => navigate("/")}>
                  <FaInfoCircle size={20} /> Learn More
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
