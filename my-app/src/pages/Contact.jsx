import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import '../Styles/Styles.css'; // Assuming this is where your CSS styles are located

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you shortly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="page-wrapper">
      <Navbar /> {/* Navbar included as part of the page wrapper */}
      
      <div className="contact-container" style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Contact Us</h2>
        <p>Have questions or need help? Fill out the form below or reach out to us directly!</p>

        <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px', height: '100px' }}
            />
          </div>

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: 'none' }}>
            Send Message
          </button>
        </form>

        <div className="shop-info" style={{ marginTop: '30px' }}>
          <h3>Our Shop Information</h3>
          <p><strong>City Tire Repair Shop</strong></p>
          <p>123 Main St, Chicago, IL 60601</p>
          <p>Phone: <a href="tel:7737270457">773-727-0457</a></p>
          <p>Email: <a href="mailto:citytirerepairshop5112@gmail.com">citytirerepairshop5112@gmail.com</a></p>
          <p>Open Hours: Monday - Friday: 8 AM - 6 PM</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
