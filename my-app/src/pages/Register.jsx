import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const url = config.apiUrl;

  const handleRegister = async () => {
    try {
      await axios.post(`${url}/register`, { username, password });
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      if (error.response) {
        setMessage(`Registration failed: ${error.response.data.message}`);
      } else if (error.request) {
        setMessage("Registration failed: No response from server.");
      } else {
        setMessage(`Registration failed: ${error.message}`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tire-black px-4 pt-20">
      <div className="card p-8 md:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-tire-red/10 border border-tire-red/30 rounded-sm flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-tire-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-wide">
            Register
          </h1>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-tire-gray-mid border border-tire-gray-light rounded-sm px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-tire-red transition-colors placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-tire-gray-mid border border-tire-gray-light rounded-sm px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-tire-red transition-colors placeholder-gray-500"
          />
          <button onClick={handleRegister} className="btn-primary w-full">
            Register
          </button>
        </div>

        {message && (
          <p
            className={`mt-4 font-body text-sm text-center ${message.includes("successful") ? "text-green-400" : "text-red-400"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;
