import React from "react";

const MobileCallButton = () => {
  return (
    <a
      href="tel:7732716009"
      className="md:hidden fixed bottom-6 right-6 z-50 w-16 h-16 bg-tire-red rounded-full flex items-center justify-center shadow-2xl shadow-red-900/50 animate-pulse-red"
      aria-label="Call City Tire Repair Shop"
    >
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    </a>
  );
};

export default MobileCallButton;
