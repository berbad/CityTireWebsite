import React from 'react';
import '../Styles/Hours.css';

const Hours = () => {
  const hours = [
    { day: 'Sun', time: '9:00 AM - 2:00 PM' },
    { day: 'Mon', time: '8:00 AM - 6:00 PM' },
    { day: 'Tue', time: '8:00 AM - 6:00 PM' },
    { day: 'Wed', time: '8:00 AM - 6:00 PM' },
    { day: 'Thu', time: '8:00 AM - 6:00 PM' },
    { day: 'Fri', time: '8:00 AM - 6:00 PM' },
    { day: 'Sat', time: '8:00 AM - 4:00 PM' },
  ];

  const currentDay = new Date().toLocaleString('en-US', { weekday: 'short' });

  return (
    <div className="hours-container">
      <h2 className="hours-title">Hours of Operation</h2>
      <div className="hours-grid">
        {hours.map((hour) => (
          <div 
            key={hour.day} 
            className={`hours-item ${hour.day === currentDay ? 'today' : ''}`}
          >
            <div className="day">{hour.day}</div>
            <div className="time">{hour.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hours;
