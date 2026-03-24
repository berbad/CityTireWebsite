import React from "react";

const ServiceCard = ({ icon, title, description, price }) => {
  return (
    <div className="card group h-full flex flex-col">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-heading text-xl font-semibold text-white uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="font-body text-gray-400 text-sm leading-relaxed mb-3 flex-grow">
        {description}
      </p>
      {price && (
        <div className="inline-block bg-tire-red/10 border border-tire-red/30 rounded-sm px-3 py-1 mt-auto self-start">
          <span className="font-heading text-tire-red text-sm tracking-wide">
            {price}
          </span>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
