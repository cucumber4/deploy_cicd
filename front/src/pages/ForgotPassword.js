import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import leftImage from "../assets/backlogin3.png";
import logo from "../assets/agalogo.png";
import { FaEnvelope, FaLock } from "react-icons/fa";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const sendResetCode = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/user/forgot-password", { email });
            setStep(2);
        } catch (error) {
            setMessage("Failed to send reset code.");
        }
    };

    const resetPassword = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/user/reset-password", {
                email,
                code,
                new_password: newPassword,
            });
            setMessage("Password reset successfully! Redirecting...");
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            setMessage("Password reset failed.");
        }
    };

    return (
        <div className="login-container">
            <div className="left-side-login" style={{ backgroundImage: `url(${leftImage})` }}>
                <img src={logo} alt="AGA Logo" className="aga-logo" />
                <p className="fade-in-text">
                    <span className="welcome-back">Forgot Your Password?</span>
                    <br />
                    No worries — you can reset it here.
                </p>
            </div>

            <div className="right-side-login">
                <div className="login-box">
                    <h2>Reset Your Password</h2>
                    <p>{step === 1 ? "Enter your email to receive a reset code." : "Enter the code and your new password below."}</p>

                    {step === 1 ? (
                        <>
                            <div className="input-group">
                                <FaEnvelope className="icon" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="login-btn" onClick={sendResetCode}>
                                Send Code
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="input-group">
                                <FaLock className="icon" />
                                <input
                                    type="text"
                                    placeholder="Reset Code"
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
                            <button className="login-btn" onClick={resetPassword}>
                                Reset Password
                            </button>
                        </>
                    )}

                    {message && <p className="message">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
