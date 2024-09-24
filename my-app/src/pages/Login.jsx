import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import '../Styles/App.css';
import config from '../config'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');


    const url = config.apiUrl
    const handleLogin = async () => {
        try {
            const response = await axios.post(`${url}/login`, {
                username,
                password
            });
            setMessage('Login successful! Token: ' + response.data.token);
        } catch (error) {
            setMessage('Login failed: ' + error.response.data.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="main-container">
                <div className="form-container">
                    <h2>Login</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleLogin} className="button-primary">Login</button>
                    {message && <p>{message}</p>}
                </div>
            </div>
        </>
    );
}

export default Login;
