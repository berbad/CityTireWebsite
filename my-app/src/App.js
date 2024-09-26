import React, { useEffect, useState } from 'react';
import "./Styles/App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import axios from 'axios';
import config from './config';
import Contact from './pages/Contact';

function App() {
  const [backendData, setBackendData] = useState([{}]);

  const url = config.apiUrl;
  
  useEffect(() => {
    axios
      .get(`${url}/api`)
      .then(response => {
        console.log(response);
        setBackendData(response.data);
      })
      .catch((error) => {
        console.log(error);
        alert("Failed to load data. Please try again.");
      });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home backendData={backendData} />} />
      <Route path="/home" element={<Home backendData={backendData} />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;
