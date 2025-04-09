// src/pages/TokenRequests.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TokenRequests.css";

const TokenRequests = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/tokens/token-requests", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data);
        } catch (error) {
            setMessage("Ошибка загрузки запросов");
        }
    }

    async function handleApprove(id) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://127.0.0.1:8000/tokens/approve-request/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
        } catch (error) {
            setMessage("Ошибка при одобрении запроса.");
        }
    }

    async function handleReject(id) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://127.0.0.1:8000/tokens/reject-request/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
        } catch (error) {
            setMessage("Ошибка при отклонении запроса.");
        }
    }

    return (
        <div className="token-page">
            <div className="token-container">
                <h2 className="token-title">💸 Запросы на получение токенов AGA</h2>

                {requests.length === 0 ? (
                    <p className="token-empty">Нет новых запросов</p>
                ) : (
                    <ul className="token-list">
                        {requests.map((req) => (
                            <li key={req.id} className="token-item">
                                <p><strong>Пользователь:</strong> {req.nickname}</p>
                                <p><strong>Email:</strong> {req.email}</p>
                                <p><strong>Wallet:</strong> {req.wallet}</p>
                                <p><strong>Количество:</strong> {req.amount} AGA</p>

                                <div className="token-buttons">
                                    <button onClick={() => handleApprove(req.id)} className="approve-button">✅ Одобрить</button>
                                    <button onClick={() => handleReject(req.id)} className="reject-button">❌ Отклонить</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {message && <p className="token-message">{message}</p>}

                <div className="token-back">
                    <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>
                </div>
            </div>
        </div>
    );
};

export default TokenRequests;
