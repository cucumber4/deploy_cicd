import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import Notifications from "../components/Notifications";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { FaVoteYea, FaUsers, FaPoll, FaInfoCircle } from "react-icons/fa";
import "./Dashboard.css";
import { FaBell, FaPlus, FaFolderOpen, FaInbox, FaSearch } from "react-icons/fa";
import CreateGroup from "./CreateGroup";
import GroupsList from "./GroupsList";
import GroupJoinRequests from "./GroupJoinRequests";
import BrowseGroups from "./BrowseGroups";



const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [polls, setPolls] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [latestPolls, setLatestPolls] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mostVotedPoll, setMostVotedPoll] = useState(null);
  const [allOpenPolls, setAllOpenPolls] = useState([]);
  const [dummyData, setDummyData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPolls, setTotalPolls] = useState(0);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("none");

  useEffect(() => {
    fetchOpenPolls();
    fetchStatistics();
  }, []);

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

  const fetchStatistics = async () => {
    try {
      const ballotsRes = await axios.get("http://127.0.0.1:8000/statistics/ballots-by-date");
      const participationRes = await axios.get("http://127.0.0.1:8000/statistics/participation");
      const totalUsersRes = await axios.get("http://127.0.0.1:8000/statistics/total-users");
      const totalPollsRes = await axios.get("http://127.0.0.1:8000/statistics/total-polls");
      const mostVotedRes = await axios.get("http://127.0.0.1:8000/statistics/most-voted-poll");

      setDummyData(ballotsRes.data.map(d => ({ date: d.date, votes: d.count })));
      setPieData([
        { name: "Participation", value: participationRes.data.voted_users },
        { name: "Remaining", value: participationRes.data.total_users - participationRes.data.voted_users }
      ]);
      setTotalUsers(totalUsersRes.data.total_users);
      setTotalPolls(totalPollsRes.data.total_polls);
      if (mostVotedRes.data) setMostVotedPoll(mostVotedRes.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

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
          <Tooltip />
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
          <p className="stats-value">
            {pieData.length > 0 ? Math.round((pieData[0].value / (pieData[0].value + pieData[1].value)) * 100) + "%" : "0%"}
          </p>
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
          <p className="stats-value">{totalUsers}</p>
        </div>
        <FaUsers size={32} />
      </div>

      <div className="stats-card blue">
        <div>
          <p className="stats-title">Total number of created polls</p>
          <p className="stats-value">{totalPolls}</p>
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
            placeholder="Search voting name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {searchActive && polls.length > 0 && (
          <div className="search-results">
            <h3 className="dashboard-heading">Search Results</h3>
            <ul className="polls-list">
              {polls.map((poll) => (
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
        )}

        <div className="top-toolbar">
          <button
            className={`toolbar-button ${activeSection === "notifications" ? "active" : ""}`}
            onClick={() => setActiveSection(activeSection === "notifications" ? "none" : "notifications")}
          >
            <FaBell /> Notifications
          </button>

          <button
            className={`toolbar-button ${activeSection === "create-group" ? "active" : ""}`}
            onClick={() => setActiveSection(activeSection === "create-group" ? "none" : "create-group")}
          >
            <FaPlus /> Create Group
          </button>

          <button
            className={`toolbar-button ${activeSection === "my-groups" ? "active" : ""}`}
            onClick={() => setActiveSection(activeSection === "my-groups" ? "none" : "my-groups")}
          >
            <FaFolderOpen /> My Groups
          </button>

          <button
            className={`toolbar-button ${activeSection === "join-requests" ? "active" : ""}`}
            onClick={() => setActiveSection(activeSection === "join-requests" ? "none" : "join-requests")}
          >
            <FaInbox /> Join Requests
          </button>

          <button
            className={`toolbar-button ${activeSection === "browse-groups" ? "active" : ""}`}
            onClick={() => setActiveSection(activeSection === "browse-groups" ? "none" : "browse-groups")}
          >
            <FaSearch /> Browse Groups
          </button>
        </div>

        {activeSection !== "none" && (
          <div className="active-section-wrapper">
            {activeSection === "notifications" && <Notifications />}
            {activeSection === "create-group" && <CreateGroup />}
            {activeSection === "my-groups" && <GroupsList />}
            {activeSection === "join-requests" && <GroupJoinRequests />}
            {activeSection === "browse-groups" && <BrowseGroups />}
          </div>
        )}


        <StatisticsChart />

        {latestPolls.length > 0 && (
          <div className={`dashboard-grid ${sidebarCollapsed ? "collapsed-grid" : ""}`}>

            {/* Recent Active Polls */}
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

            {/* Right Statistics Panel */}
            <div className="stats-wrapper">
              <h3 className="dashboard-heading">Our Current Statistics</h3>
              <RightStatsPanel />
            </div>

            {/* Most Voted Poll (only when sidebar is collapsed) */}
            {sidebarCollapsed && mostVotedPoll && (
              <div className="most-voted-card" onClick={() => navigate(`/vote/${mostVotedPoll.poll_id}`)}>
                <h3>🏆 Most Voted Poll</h3>
                <p>{mostVotedPoll.poll_name}</p>

                <ResponsiveContainer width="100%" height={60}>
                  <BarChart
                    data={[{ name: mostVotedPoll.poll_name, votes: mostVotedPoll.vote_count }]}
                    layout="vertical"
                  >
                    <XAxis type="number" hide />
                    <Tooltip />
                    <Bar dataKey="votes" fill="url(#barGradient)" radius={[0, 10, 10, 0]} />
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