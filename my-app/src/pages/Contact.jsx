import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import axios from 'axios';
import '../Styles/Styles.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formspreeEndpoint = 'https://formspree.io/f/xeojyjve';
    
    axios.post(formspreeEndpoint, formData)
      .then(response => {
        setFormStatus('Thank you for contacting us! We will get back to you shortly.');
        setIsSubmitting(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      })
      .catch(error => {
        setFormStatus('Failed to send the message. Please try again later.');
        setIsSubmitting(false);
      });
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="contact-container" style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Contact Us</h2>
        <p>Have questions or need help? Fill out the form below or reach out to us directly!</p>

        {formStatus && <p style={{ color: formStatus.includes('Failed') ? 'red' : 'green' }}>{formStatus}</p>}

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

          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: 'none' }}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className="shop-info" style={{ marginTop: '30px' }}>
          <h3>Our Shop Information</h3>
          <p><strong>City Tire Repair Shop</strong></p>
          <p>5112 N Lincoln Ave, Chicago, IL 60625</p>
          <p>Phone: <a href="tel:7732716009">(773) 271-6009</a></p>
          <p>Email: <a href="mailto:citytirerepairshop5112@gmail.com">citytirerepairshop5112@gmail.com</a></p>
          <p>Open Hours: Monday - Friday: 8 AM - 6 PM</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
