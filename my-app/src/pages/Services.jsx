import React from 'react';
import Navbar from '../Components/Navbar'; // Ensure the path is correct
import '../Styles/Styles.css';

const Services = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <section id="services-page">
        <div className="services-content">
          <h1>Our Services</h1>
          <p>
            At City Tire Repair Shop, we offer a comprehensive range of tire and automotive services to ensure your vehicle is safe and running smoothly. Our skilled technicians are here to provide you with top-quality service and expert advice.
          </p>
          <ul>
            <li>
              <h2>Tire Replacement</h2>
              <p>We offer a wide selection of high-quality tires for all types of vehicles. Our team will help you choose the best tires for your needs and ensure a professional installation.</p>
            </li>
            <li>
              <h2>Tire Repair</h2>
              <p>From puncture repairs to patching, we provide reliable tire repair services to get you back on the road safely.</p>
            </li>
            <li>
              <h2>Tire Balancing</h2>
              <p>We balance your tires to ensure a smooth ride and prevent uneven tire wear, enhancing your vehicle's performance.</p>
            </li>
            <li>
              <h2>Brake Services</h2>
              <p>In addition to tire services, we offer brake inspections and repairs to keep your vehicle's braking system in top condition.</p>
            </li>
            <li>
              <h2>Seasonal Tire Changes</h2>
              <p>Switch between summer and winter tires with ease. We offer quick and efficient seasonal tire change services.</p>
            </li>
          </ul>
          <p>
            For more information about our services or to schedule an appointment, please <a href="/contact">contact us</a>. We're here to help with all your tire and automotive needs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Services;
