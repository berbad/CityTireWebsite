import React, { useEffect, useState } from 'react';
import "./Styles/App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Login from './pages/Login';
import Register from './pages/Register';
import axios from 'axios';
import config from './config'

function App() {
  const [backendData, setBackendData] = useState([{}]);

  const url = config.apiUrl
    useEffect(() => {
      axios
      .get(`${url}/api`)
      .then(response => {
        console.log(response);
        setBackendData(response.data); // Assuming you want to set the response data in state
      })
      .catch((error) => {
        console.log(error);
        alert("Failed to load data. Please try again.");
      });
  }, []); // The empty array ensures this runs only once, when the component is mounted.

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
