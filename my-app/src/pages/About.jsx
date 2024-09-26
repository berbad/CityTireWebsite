import React from "react";
import Navbar from '../Components/Navbar';
import '../Styles/Styles.css';

const About = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <section id="about-page">
        <div className="about-content">
          <h1>About City Tire Repair Shop</h1>
          <p>
            At City Tire Repair Shop, we’ve been providing quality used tires to the Chicagoland area since 2005. As a family-owned business, we’re committed to offering affordable, reliable tire services while treating every customer like part of the family.
          </p>
          <p>
            Our mission is simple: to help drivers save money with high-quality used tires while ensuring safety on the road. Whether you need a tire replacement, repair, or expert advice, our experienced team is here to assist.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li><strong>Integrity:</strong> Honest and upfront pricing for all our services.</li>
            <li><strong>Quality:</strong> Every tire is inspected to meet safety standards.</li>
            <li><strong>Customer Care:</strong> We strive to provide excellent service with every visit.</li>
            <li><strong>Community:</strong> Proud to serve the Chicago area with dedication and care.</li>
          </ul>

          <h2>Why Choose Us?</h2>
          <ul>
            <li><strong>Affordable Tires:</strong> Save money with top-quality used tires.</li>
            <li><strong>Expert Service:</strong> Skilled technicians to ensure your vehicle is road-ready.</li>
            <li><strong>Convenience:</strong> Fast, friendly service to get you back on the road quickly.</li>
          </ul>

          <p className='thank-you'>
            Visit us at 5112 N. Lincoln Ave, Chicago, or call <a href="tel:+17732716009">(773) 271-6009</a> to learn more about how we can help with your tire needs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
