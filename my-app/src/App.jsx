import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import MobileCallButton from './Components/Mobilecallbutton';
import ScrollToTop from './Components/Scrolltotop';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Recovery from './admin/Recovery';
function App() {
  const { pathname } = useLocation();
  const privateArea = /^\/(admin(?:\/|$)|login\/?$|register\/?$|recover\/?$)/.test(pathname);
  if (privateArea) return <Routes><Route path="/admin/*" element={<Admin />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/recover" element={<Recovery />} /></Routes>;
  return <div className="flex flex-col min-h-screen bg-tire-black"><ScrollToTop /><Navbar /><main className="flex-grow"><Routes><Route path="/" element={<Home />} /><Route path="/home" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/services" element={<Services />} /><Route path="/contact" element={<Contact />} /></Routes></main><Footer /><MobileCallButton /></div>;
}
export default App;
