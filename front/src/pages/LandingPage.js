import React from "react";
import "./LandingPage.css";
import securityIcon from "../assets/about2.png";
import { useNavigate } from "react-router-dom";
import videoBg from "../assets/background.mp4"
import Navbar from "../pages/Navbar";
import how1 from "../assets/how1f.jpg";
import how2 from "../assets/how2f.png";
import how3 from "../assets/how3f.png";
import how4 from "../assets/how4.png";

import referendum from "../assets/referendum.jpg";
import corporate from "../assets/office-coporate.jpg";
import social from "../assets/social.jpg";
import funding from "../assets/funding.jpg";
import dao from "../assets/dao.jpeg";

import metamaskLogo from "../assets/metalogof.png";
import registerImg from "../assets/register.jpg";
import walletAddressImg from "../assets/wallet.png";
import lockImg from "../assets/lock.png";
import confirm from  "../assets/confirm.png";
import arrowIcon from "../assets/arrow.png"
const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <Navbar />
            {/* Hero Section */}
            <div className="hero-section" >
                <video autoPlay loop muted playsInline className="background-video">
                    <source src={videoBg} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="content">
                    <div className="text-container">
                        <h1 className="landing-title">
                            Welcome <br /> to our modern, secure voting system
                        </h1>
                        <button className="big-login-btn" onClick={() => navigate("/register")}>
                            Register
                        </button>
                    </div>
                </div>


                <div className="stats-bar">
                    <div className="stat-item">
                        <h2>95%</h2>
                        <p>More Secure Than Centralized Voting</p>
                    </div>
                    <div className="stat-item">
                        <h2>0%</h2>
                        <p>Risk of Data Tampering</p>
                    </div>
                    <div className="stat-item">
                        <h2>0 ETH</h2>
                        <p>	Cost to Vote</p>
                    </div>
                    <div className="stat-item">
                        <h2>100%</h2>
                        <p>Free and Public</p>
                    </div>

                </div>

            </div>

            {/* Security Features Section */}
            <div className="security-section" id="security">
                <div className="security-content">
                    <div className="left-side">
                        <img src={securityIcon} alt="Security Illustration" className="security-image" />
                    </div>
                    <div className="right-side">
                        <span className="trusted-label">Trusted & Secure Voting</span>
                        <h2 className="security-title">
                            Advanced Security for a Reliable Voting System
                        </h2>
                        <div className="features-container">
                            <div className="feature-box">
                                <span className="checkmark">✔</span>
                                <div>
                                    <h3>Blockchain-Powered Voting</h3>
                                    <p>Every vote is securely recorded on the Ethereum blockchain, making it impossible to tamper with or delete. This ensures full transparency and trust — anyone can verify the results, but no one can alter them. All voting happens directly from the user's wallet, not through a centralized system.</p>
                                </div>
                            </div>
                            <div className="feature-box">
                                <span className="checkmark">✔</span>
                                <div>
                                    <h3>Free & Secure Participation</h3>
                                    <p>Voting is completely free. AGA tokens are used to confirm participation and prevent spam — but they are not real money and have no monetary value. Everyone receives tokens automatically when registering or requesting them, so every user can vote fairly and securely without cost.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="how-it-works" id="how">
                <h2 className="how-title">How It Works?</h2>
                <p className="how-description">
                    Our platform allows users to propose votes, which are then reviewed and made available for all members.
                </p>

                <div className="steps-container">
                    {/* Step 1 */}
                    <div className="step-card">
                        <img src={how1} alt="Create a Vote" />
                        <button className="step-btn">Create a Vote</button>
                        <div className="step-text">
                            <p>Any user can suggest a new voting topic and create groups.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="step-card">
                        <img src={how2} alt="Admin Approval" />
                        <button className="step-btn">Admin Approval</button>
                        <div className="step-text">
                            <p>Ensures relevance and prevents spam.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="step-card">
                        <img src={how3} alt="Open Voting" />
                        <button className="step-btn">Open Voting</button>
                        <div className="step-text">
                            <p>Users can propose their own polls and vote in them.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="step-card">
                        <img src={how4} alt="History & Transparency" />
                        <button className="step-btn">History </button>
                        <div className="step-text">
                            <p>All votes and results are permanently recorded.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* use case */}
            <div className="use-cases-section" id="usecases">
                <h2 className="section-title">Where Can It Be Used?</h2>
                <p className="section-description">
                    Our platform is useful in various areas where trust and transparency are essential:
                </p>

                <div className="use-cases-container">
                    <div className="use-case">
                        <img src={referendum} alt="Elections and Referendums" className="use-case-icon" />
                        <h3>Elections & Referendums</h3>
                        <p>Blockchain eliminates vote tampering and ensures a fair process.</p>
                    </div>
                    <div className="use-case">
                        <img src={corporate} alt="Corporate Voting" className="use-case-icon" />
                        <h3>Corporate Voting</h3>
                        <p>Businesses can use our system for shareholder meetings and employee decisions.</p>
                    </div>
                    <div className="use-case">
                        <img src={social} alt="Community and Social Projects" className="use-case-icon" />
                        <h3>Community & Social Projects</h3>
                        <p>Organizations can collect opinions and make collective decisions securely.</p>
                    </div>
                    <div className="use-case">
                        <img src={funding} alt="Grant and Fund Distribution" className="use-case-icon" />
                        <h3>Grant & Fund Distribution</h3>
                        <p>Investors and charities can use fair, transparent selection processes.</p>
                    </div>
                    <div className="use-case">
                        <img src={dao} alt="Decentralized Autonomous Organizations (DAO)" className="use-case-icon" />
                        <h3>Decentralized Autonomous Organizations (DAO)</h3>
                        <p>Crypto communities can vote on project developments.</p>
                    </div>
                </div>
            </div>

            {/*how to register */}
            <div className="register-section" id="register">
              <h2 className="register-title">How to Register</h2>
              <p className="register-subtitle">To participate, follow these steps:</p>

              <div className="register-steps">
                {/* Step 1 */}
                <div className="step">
                  <img src={metamaskLogo} alt="MetaMask" className="step-img" />
                  <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="step-link">
                    MetaMask
                  </a>
                  <p className="step-text">Create a MetaMask wallet for secure authentication.</p>
                </div>

                <img src={arrowIcon} alt="Arrow" className="arrow-icon" />

                {/* Step 2 */}
                <div className="step">
                  <img src={registerImg} alt="Register Page" className="step-img" />
                  <a href="/register" className="step-link">Registration Page</a>
                  <p className="step-text">Sign up to get access.</p>
                </div>

                <img src={arrowIcon} alt="Arrow" className="arrow-icon" />

                {/* Step 3 */}
                <div className="step">
                  <img src={walletAddressImg} alt="Wallet Address" className="step-img" />
                  <span className="step-link">Enter Wallet Address</span>
                  <p className="step-text">Your unique ID for voting.</p>
                </div>

                <img src={arrowIcon} alt="Arrow" className="arrow-icon" />

                {/* Step 4 */}
                <div className="step">
                  <img src={lockImg} alt="Secure Account" className="step-img" />
                  <span className="step-link">Set Up Account</span>
                  <p className="step-text">Create a username & password.</p>
                </div>

                <img src={arrowIcon} alt="Arrow" className="arrow-icon" />

                {/* Step 5 */}
                <div className="step">
                  <img src={confirm} alt="Confirmation" className="step-img" />
                  <span className="step-link">Confirm & Start Voting</span>
                  <p className="step-text">Access all features instantly.</p>
                </div>
              </div>

              <p className="register-footer">
                Once registered, you can vote, propose topics, create groups, and track your voting history. <br />
                <strong>Join us in shaping the future of fair and transparent voting!</strong>
              </p>
            </div>

            <div className="contact-section" id="contact">
  <h2 className="contact-title-gradient">Have a problem or new ideas?</h2>
  <p className="contact-subtitle">We'd love to hear from you. Reach out anytime.</p>

  <div className="contact-box">
    <div className="contact-left">
      <p className={"p-contact"}>Email: <a href="mailto:aga.voting.project@gmail.com">aga.voting.project@gmail.com</a></p>
      <p className={"p-contact"}>Telegram: <a href="https://t.me/yourprojectchat" target="_blank" rel="noreferrer">@yourprojectchat</a></p>
    </div>
    <div className="contact-right">
      <p className={"p-contact"}>Feel free to suggest features, report issues, or share feedback — we’re always improving!</p>
    </div>
  </div>
</div>

        </div>
    );
};

export default LandingPage;