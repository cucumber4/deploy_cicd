// src/pages/Results.js
import React from "react";
import "./Results.css";
import { useNavigate } from "react-router-dom";

const mockResults = [
  {
    id: 1,
    title: "Student Council Election",
    candidates: [
      { name: "Alice", votes: 120 },
      { name: "Bob", votes: 80 },
      { name: "Charlie", votes: 50 }
    ],
    totalVotes: 250
  },
  {
    id: 2,
    title: "Cafeteria Menu Vote",
    candidates: [
      { name: "Option A", votes: 95 },
      { name: "Option B", votes: 105 }
    ],
    totalVotes: 200
  }
];

const Results = () => {
  const navigate = useNavigate();

  return (
    <div className="results-container">
      <header className="results-header">
        <h1 className="results-title">📊 Voting Results</h1>
        <p>Check the outcomes of recent polls below</p>
      </header>

      <div className="results-grid">
        {mockResults.map((result) => (
          <div key={result.id} className="result-card">
            <div className="result-card-inner">
              <h2>{result.title}</h2>
              <ul>
                {result.candidates.map((c, index) => (
                  <li key={index}>
                    <strong>{c.name}</strong>: {c.votes} votes
                  </li>
                ))}
              </ul>
              <p className="total-votes">Total Votes: {result.totalVotes}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="results-footer">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <p>&copy; 2025 Decentrathon Voting System</p>
      </div>
    </div>
  );
};

export default Results;