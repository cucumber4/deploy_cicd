// src/pages/ResetPassword.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import logo from "../assets/agalogo.png";
import "./ForgotPassword.css";

const ResetPassword = () => {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleReset = async () => {
        if (newPassword !== confirmPassword) {
            setMessage("❌ Пароли не совпадают!");
            return;
        }

        try {
            await axios.post("http://127.0.0.1:8000/user/reset-password", {
                code,
                new_password: newPassword
            });
            setMessage("✅ Пароль успешно сброшен! Перенаправление...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage("❌ Ошибка сброса пароля.");
        }
    };

    return (
        <div className="login-container">
            <div className="left-side-login">
                <img src={logo} alt="AGA Logo" className="aga-logo" />
            </div>
            <div className="right-side-login">
                <div className="form-box">
                    <h2>Reset Password</h2>
                    <p>Enter the code from your email and a new password.</p>

                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="text"
                            placeholder="Verification Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="register-btn" onClick={handleReset}>
                        Reset Password
                    </button>

                    {message && <p className="message">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;