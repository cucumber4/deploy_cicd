// src/pages/ProposalsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProposalsList.css";

const ProposalsList = () => {
    const [proposals, setProposals] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProposals();
    }, []);

    async function fetchProposals() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/polls/proposals", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(response.data);
        } catch (error) {
            setMessage("Ошибка загрузки предложенных голосований.");
        }
    }

    async function approvePoll(proposalId) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/polls/approve/${proposalId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProposals((prevProposals) =>
                prevProposals.map((proposal) =>
                    proposal.id === proposalId ? { ...proposal, approved_by_admin: true } : proposal
                )
            );

            setMessage("Голосование одобрено!");
        } catch (error) {
            setMessage("Ошибка одобрения голосования.");
        }
    }

    async function rejectPoll(proposalId) {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/polls/reject/${proposalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProposals((prevProposals) => prevProposals.filter((proposal) => proposal.id !== proposalId));
            setMessage("Голосование отклонено.");
        } catch (error) {
            setMessage("Ошибка отклонения голосования.");
        }
    }

    async function sendToContract(proposalId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`/api/polls/send-to-contract/${proposalId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProposals((prevProposals) =>
                prevProposals.map((proposal) =>
                    proposal.id === proposalId ? { ...proposal, approved: true } : proposal
                )
            );

            setMessage(`Голосование отправлено в контракт! TX Hash: ${response.data.tx_hash}`);
        } catch (error) {
            setMessage("Ошибка отправки голосования в контракт.");
        }
    }

    return (
        <div className="proposals-page">
            <div className="proposals-container">
                <h2 className="proposals-header">📨 Предложенные голосования</h2>

                {proposals.length === 0 ? (
                    <p>Нет предложенных голосований.</p>
                ) : (
                    <ul className="proposal-list">
                        {proposals.map((proposal) => (
                            <li key={proposal.id} className="proposal-item">
                                <strong>{proposal.name}</strong>
                                <ul className="candidate-list">
                                    {proposal.candidates.map((candidate, index) => (
                                        <li key={index}>{candidate}</li>
                                    ))}
                                </ul>

                                {!proposal.approved_by_admin ? (
                                    <>
                                        <button onClick={() => approvePoll(proposal.id)} className="approve-button">
                                            ✅ Одобрить
                                        </button>
                                        <button onClick={() => rejectPoll(proposal.id)} className="reject-button">
                                            ❌ Отклонить
                                        </button>
                                    </>
                                ) : !proposal.approved ? (
                                    <button onClick={() => sendToContract(proposal.id)} className="contract-button">
                                        🚀 Отправить в контракт
                                    </button>
                                ) : (
                                    <p style={{ color: "#888", fontWeight: "bold" }}>📦 Отправлено в контракт</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {message && <p className="proposals-message">{message}</p>}

                <div className="proposals-back">
                    <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>
                </div>
            </div>
        </div>
    );
};

export default ProposalsList;
