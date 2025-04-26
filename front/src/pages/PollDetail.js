// pages/PollDetail.js
import "./CreatePoll.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import { FiCopy, FiCheck } from "react-icons/fi";
import "./PollDetail.css";

const PollDetail = () => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);

  const TOKEN_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F";
  const VOTING_CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9";

  const TOKEN_ABI = [
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  useEffect(() => {
    fetchPoll();
  }, []);

  const fetchPoll = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/polls/list/");
      const found = res.data.find((p) => p.id == pollId);
      if (!found) return setMessage("Poll not found.");
      setPoll(found);
    } catch (err) {
      setMessage("Error loading poll.");
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const vote = async (candidate) => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const token = localStorage.getItem("token");

    try {
      setStatus("loading");
      setMessage("Checking token allowance...");

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const allowance = await tokenContract.allowance(userAddress, VOTING_CONTRACT_ADDRESS);

      if (allowance < ethers.parseUnits("10", 18)) {
        setMessage("Approving 10 AGA tokens...");
        const approveTx = await tokenContract.approve(VOTING_CONTRACT_ADDRESS, ethers.parseUnits("10", 18));
        await approveTx.wait();
        setMessage("Approval successful. Preparing vote...");
      }

      const res = await axios.post(
        `http://127.0.0.1:8000/votes/${pollId}/${candidate}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const txData = res.data.transaction;
      const tx = await signer.sendTransaction({
        to: txData.to,
        value: txData.value ? ethers.toBigInt(txData.value) : 0n,
        gasLimit: txData.gas,
        gasPrice: txData.gasPrice,
        nonce: txData.nonce,
        data: txData.data,
      });

      setMessage(`Vote submitted! Waiting for blockchain confirmation...`);
      await tx.wait();

      // Умная проверка транзакции
      let confirmed = false;
      let attempts = 5; // попробуем 5 раз
      for (let i = 0; i < attempts; i++) {
        try {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (receipt && receipt.status === 1) {
            confirmed = true;
            break;
          }
        } catch (e) {
          console.log(`Attempt ${i + 1}: Transaction not found yet.`);
        }
        await sleep(2000); // ждём 2 секунды между попытками
      }

      if (!confirmed) {
        throw new Error("Transaction not confirmed on chain after multiple attempts.");
      }

      // Теперь подтверждаем голос на сервере
      await axios.post("http://127.0.0.1:8000/votes/confirm",
  {
      poll_id: pollId,
      candidate: candidate,
      transaction_hash: tx.hash,
      },
    {
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    }
  }
);



      setStatus("success");
      setMessage(`🎉 Vote confirmed! Hash: ${tx.hash}`);

    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(`❌ ${err.response?.data?.detail || err.message || "Voting failed."}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-container montserrat-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content page-centered">
        <div className="card">
          <h2 className="header">Poll</h2>
          {poll ? (
            <>
              <h3 className="poll-title">{poll.name}</h3>
              <p className="poll-description">{poll.description}</p>

              <div className="candidate-list">
                {poll.candidates.map((candidate, index) => (
                  <button
                    key={index}
                    className="gradient-button candidate-button"
                    onClick={() => vote(candidate)}
                    disabled={status === "loading"}
                  >
                    {candidate}
                  </button>
                ))}
              </div>

              {status === "loading" && <p>⏳ {message}</p>}
              {status === "success" && (
                <div className="message-box">
                  <p className="message-title">✅ Vote successfully confirmed!</p>
                  <div className="message-hash-row">
                    <code className="message-hash">{message.split("Hash:")[1]?.trim()}</code>
                    <button
                      onClick={() => copyToClipboard(message.split("Hash:")[1]?.trim())}
                      className="copy-button"
                      title="Copy to clipboard"
                    >
                      {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
                    </button>
                  </div>
                  <div className="etherscan-link">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${message.split("Hash:")[1]?.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Etherscan ↗
                    </a>
                  </div>
                </div>
              )}
              {status === "error" && (
                <div className="message-box error">
                  <p>{message}</p>
                </div>
              )}
            </>
          ) : (
            <p className="loading-text">Loading poll...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetail;
