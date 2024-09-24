import React from 'react';
import '../Styles/FeatureSection.css';

const FeatureSection = () => {
  const features = [
    {
      title: 'Fast and Efficient Service',
      description: 'We value your time. Our streamlined processes ensure that you receive fast, efficient, and high-quality service every time you visit. Get in and out quickly without compromising on service quality.',
      icon: '🚗',
    },
    {
      title: 'Rated #1 in Google Reviews',
      description: 'Our location is rated at 4.5 stars or higher. We take pride in providing the best customer service in the business and our reviews highlight that fact.',
      icon: '🏆',
    },
    {
      title: 'Family Owned and Operated in the USA',
      description: 'Run by the Badel family for 15+ years, we know how to treat people right. We understand the challenges of work and family. At City Tire our customers are family.',
      icon: '👨‍👩‍👧‍👦',
    },
    {
      title: 'Unparalleled Years of Experience',
      description: 'Serving the Chicagoland region since 2005, we are dedicated to providing the best products and services that last for the long haul.',
      icon: '⌛',
    },
  ];

  return (
    <div className="feature-section">
      <div className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-card-title">{feature.title}</h3>
            <p className="feature-card-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;
