import React from "react";

const Hours = ({ compact = false }) => {
  const hours = [
    { day: "Sun", full: "Sunday", time: "9:00 AM – 2:00 PM" },
    { day: "Mon", full: "Monday", time: "8:00 AM – 6:00 PM" },
    { day: "Tue", full: "Tuesday", time: "8:00 AM – 6:00 PM" },
    { day: "Wed", full: "Wednesday", time: "8:00 AM – 6:00 PM" },
    { day: "Thu", full: "Thursday", time: "8:00 AM – 6:00 PM" },
    { day: "Fri", full: "Friday", time: "8:00 AM – 6:00 PM" },
    { day: "Sat", full: "Saturday", time: "8:00 AM – 4:00 PM" },
  ];

  const currentDay = new Date().toLocaleString("en-US", { weekday: "short" });

  if (compact) {
    return (
      <div className="space-y-2">
        {hours.map((h) => (
          <div
            key={h.day}
            className={`flex justify-between text-sm font-body ${
              h.day === currentDay
                ? "text-tire-red font-semibold"
                : "text-gray-400"
            }`}
          >
            <span>{h.full}</span>
            <span>{h.time}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {hours.map((h) => (
        <div
          key={h.day}
          className={`rounded-sm px-4 py-3 text-center min-w-[100px] transition-all duration-200 ${
            h.day === currentDay
              ? "bg-tire-red text-white shadow-lg shadow-red-900/30"
              : "bg-tire-gray-dark text-gray-300 border border-tire-gray-light"
          }`}
        >
          <div className="font-heading text-sm font-bold uppercase tracking-wider">
            {h.day}
          </div>
          <div className="font-body text-xs mt-1 opacity-80">{h.time}</div>
        </div>
      ))}
    </div>
  );
};

export default Hours;
