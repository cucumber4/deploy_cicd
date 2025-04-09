// src/pages/Results.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const Results = () => {
    const [polls, setPolls] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [votes, setVotes] = useState({});
    const [message, setMessage] = useState("");
    const [hoverButton, setHoverButton] = useState(false);

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        fetchPolls();
    }, []);

    async function fetchPolls() {
        try {
            const response = await axios.get("/api/polls/list/");
            setPolls(response.data);
        } catch (error) {
            console.error("Ошибка загрузки голосований:", error);
            setMessage("Ошибка загрузки голосований.");
        }
    }

    async function fetchVotes() {
        if (!selectedPoll) {
            alert("Выберите голосование!");
            return;
        }

        setMessage("Загрузка результатов...");

        try {
            const selectedPollData = polls.find(p => p.id == selectedPoll);
            if (!selectedPollData) {
                setMessage("Ошибка: голосование не найдено!");
                return;
            }

            let results = {};
            for (let candidate of selectedPollData.candidates) {
                const response = await axios.get(`/api/votes/${selectedPoll}/${candidate}`);
                results[candidate] = response.data.votes;
            }

            setVotes(results);
            setMessage("");
        } catch (error) {
            console.error("Ошибка загрузки результатов:", error);
            setMessage("Ошибка загрузки результатов голосования.");
        }
    }

    const pageStyle = {
        minHeight: "100vh",
        width: "100%",
        background: "url('backlogin3.png') no-repeat center center fixed",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', sans-serif",
    };
    

    const containerStyle = {
        width: "600px",
        padding: "30px",
        borderRadius: "16px",
        background: "#fff",
        backgroundClip: "padding-box",
        border: "4px solid transparent",
        boxShadow: "0 0 20px rgba(0,0,0,0.15)",
        backgroundOrigin: "border-box",
        position: "relative",
    };

    const containerWrapperStyle = {
        background: "linear-gradient(135deg, #6e8efb, #a777e3)",
        borderRadius: "20px",
        padding: "2px",
    };

    const headerStyle = {
        marginBottom: "10px",
        textAlign: "center",
        color: "#6e8efb",
        fontSize: "1.8rem",
        fontWeight: 700,
    };

    const selectBoxStyle = {
        display: "flex",
        gap: "10px",
        alignItems: "center",
    };

    const selectStyle = {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        backgroundColor: "#f4f4f4",
        color: "#333",
        fontSize: "1rem",
        flex: 1,
    };

    const buttonStyle = {
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        background: "linear-gradient(to right, #42e695, #3bb2b8)",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
        transition: "0.3s",
    };

    const messageStyle = {
        marginTop: "15px",
        textAlign: "center",
        fontSize: "1rem",
        backgroundColor: "#f0f0f0",
        padding: "12px",
        borderRadius: "8px",
        color: "#333",
    };

    const resultsStyle = {
        marginTop: "10px",
        padding: "10px",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    };

    const resultItemStyle = {
        marginBottom: "10px",
        fontSize: "1rem",
        fontWeight: 500,
    };

    return (
        <div style={pageStyle}>
            <div style={containerWrapperStyle}>
                <div style={containerStyle}>
                    <h1 style={headerStyle}>📊 Результаты голосования</h1>

                    {polls.length === 0 ? (
                        <p>Нет доступных голосований.</p>
                    ) : (
                        <div style={selectBoxStyle}>
                            <select
                                style={selectStyle}
                                onChange={(e) => setSelectedPoll(e.target.value)}
                            >
                                <option value="">-- Выберите голосование --</option>
                                {polls.map((poll) => (
                                    <option key={poll.id} value={poll.id}>{poll.name}</option>
                                ))}
                            </select>
                            <button
                                style={buttonStyle}
                                onClick={fetchVotes}
                            >
                                Показать результаты
                            </button>
                        </div>
                    )}

                    {message && <p style={messageStyle}>{message}</p>}

                    {Object.keys(votes).length > 0 && (
                        <div style={resultsStyle}>
                            <h2 style={{ textAlign: "center", color: "#3bb2b8" }}>Итоги</h2>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {Object.entries(votes).map(([candidate, voteCount]) => (
                                    <li key={candidate} style={resultItemStyle}>
                                        {candidate}: <strong>{voteCount}</strong> голосов
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Results;
