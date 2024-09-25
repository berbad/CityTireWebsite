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
            Welcome to City Tire Repair Shop! Since our inception in 2005, we have been dedicated to providing the Chicagoland area with top-notch tire services. As a family-owned and operated business, we take pride in treating our customers like family.
          </p>
          <p>
            Our journey started with a simple mission: to offer fast, reliable, and affordable tire solutions to our community. Over the years, we've expanded our services to include not just tire sales and repairs, but also a range of automotive services designed to keep you safe on the road.
          </p>
          <p>
            What sets us apart? It's our commitment to quality and our unparalleled customer service. Our team is composed of experienced professionals who are passionate about what they do. Whether you're here for a tire replacement, a routine check-up, or expert advice, you can count on us to provide the best care for your vehicle.
          </p>
          <h2>Our Values</h2>
          <ul>
            <li><strong>Integrity:</strong> We believe in honest, transparent service. You'll always know what you're getting and why.</li>
            <li><strong>Quality:</strong> We use top-quality products and ensure all our work meets the highest standards.</li>
            <li><strong>Community:</strong> We are proud to be a part of the Chicagoland community and strive to give back whenever we can.</li>
            <li><strong>Customer Focus:</strong> Your satisfaction is our top priority. We're here to make sure you leave with a smile.</li>
          </ul>
          <h2>Why Choose Us?</h2>
          <p>
            At City Tire Repair Shop, we know you have choices when it comes to your automotive needs. Here’s why you should choose us:
          </p>
          <ul>
            <li><strong>Expertise:</strong> Our technicians are highly skilled and continuously trained to stay up-to-date with the latest in tire and automotive technology.</li>
            <li><strong>Convenience:</strong> We offer a wide range of services under one roof, making us a one-stop-shop for all your tire and automotive needs.</li>
            <li><strong>Customer Service:</strong> We go above and beyond to ensure you have a positive experience, from the moment you call us to when you drive away.</li>
          </ul>
          <p class='thank-you'>
            Thank you for considering City Tire Repair Shop. We look forward to serving you and ensuring your safety and satisfaction on the road. Come visit us today at 5112 N. Lincoln Ave, Chicago, IL 60625, or give us a call at <a href="tel:+17732716009">(773) 271-6009</a>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
