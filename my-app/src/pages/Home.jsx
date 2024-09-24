import React from "react";
import FeatureSection from '../Components/FeatureSection';
import Navbar from '../Components/Navbar';
import Hours from '../Components/Hours';
import '../Styles/Styles.css';

const Home = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <Hours />
      <main className="home-content">
        <section className="welcome-section">
          <h1>Welcome to City Tire Repair Shop</h1>
          <p>
            Your premier destination for all your tire needs! Whether you're
            looking to replace worn-out tires, upgrade to high-performance
            models, or simply seeking expert advice, we're here to help.
          </p>
          <p>
            At City Tire Repair Shop, we pride ourselves on offering
            top-quality tires from leading brands, paired with exceptional
            customer service. Explore our wide selection, schedule a tire
            fitting, or consult with our knowledgeable staff today. Your
            journey starts here – with tires that ensure safety, performance,
            and reliability on the road.
          </p>
        </section>
      </main>
      <FeatureSection />
      <section className="map-section">
        <h2>Our Location</h2>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d95041.53679818039!2d-87.74749819058175!3d41.891824247703575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fd202219a6895%3A0xe8e41d6410137d1b!2sCity%20Tire%20Repair%20Shop!5e0!3m2!1sen!2sus!4v1724962481912!5m2!1sen!2sus"
            width="600"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            title="City Tire Repair Shop Location"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Home;
