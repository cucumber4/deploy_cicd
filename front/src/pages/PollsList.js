// src/pages/PollsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./PollsList.css";

const PollsList = () => {
    const [polls, setPolls] = useState([]);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPolls();
    }, []);

    async function fetchPolls() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/polls/all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPolls(response.data);
        } catch (error) {
            console.error("Ошибка загрузки голосований");
        }
    }

    const filteredPolls = showActiveOnly
        ? polls.filter(poll => new Date(poll.end_date) > new Date())
        : polls;

    return (
        <div className="polls-page">
            <div className="polls-container">
                <h1 className="polls-title">🗳️ Все голосования</h1>

                <div className="polls-filter">
                    <button 
                        className={`filter-button ${showActiveOnly ? "active" : ""}`}
                        onClick={() => setShowActiveOnly(true)}
                    >Только активные</button>
                    <button 
                        className={`filter-button ${!showActiveOnly ? "active" : ""}`}
                        onClick={() => setShowActiveOnly(false)}
                    >Показать все</button>
                </div>

                {filteredPolls.length === 0 ? (
                    <p className="polls-empty">Нет голосований для отображения.</p>
                ) : (
                    <div className="polls-grid">
                        {filteredPolls.map((poll) => (
                            <div key={poll.id} className="poll-card">
                                <div className="poll-card-inner">
                                    <h3>{poll.name}</h3>
                                    <p>{poll.description}</p>
                                    <p className="poll-date">До: {new Date(poll.end_date).toLocaleDateString()}</p>
                                    <button 
                                        className="vote-button"
                                        onClick={() => navigate(`/vote/${poll.id}`)}
                                    >Проголосовать</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollsList;