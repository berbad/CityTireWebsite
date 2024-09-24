import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import '../Styles/App.css';
import config from '../config'

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    

    const url = config.apiUrl
    const handleRegister = async () => {
        try {
            const response = await axios.post(`${url}/register`, {
                username,
                password
            });
            setMessage('Registration successful! You can now log in.');
        } catch (error) {
            setMessage('Registration failed: ' + error.response.data.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="main-container">
                <div className="form-container">
                    <h2>Register</h2>
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
                    <button onClick={handleRegister} className="button-primary">Register</button>
                    {message && <p>{message}</p>}
                </div>
            </div>
        </>
    );
}

export default Register;
