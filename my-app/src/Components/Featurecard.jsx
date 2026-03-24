import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 opacity-0 animate-fade-in-up">
      <div className="w-16 h-16 bg-tire-red/10 border border-tire-red/30 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="font-heading text-lg font-semibold text-white uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="font-body text-gray-400 text-sm leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
