import React from "react";
import ServiceCard from "../Components/Servicecard";

const Services = () => {
  const services = [
    {
      icon: "🛞",
      title: "Used Tire Sales",
      description:
        "Quality inspected used tires for all vehicle types — sedans, trucks, SUVs, and more. Every tire is checked for tread depth, sidewall condition, and overall safety before it hits the floor.",
      price: "Call for pricing",
    },
    {
      icon: "🔌",
      title: "Tire Plugs",
      description:
        "Quick plug repairs for simple tread-area punctures. Fast turnaround — most plug repairs done in 15 minutes or less.",
      price: "Starting at $20",
    },
    {
      icon: "⚙️",
      title: "Tire Installation",
      description:
        "Professional tire mounting on your existing rims. We handle everything from passenger cars to light trucks with care and precision.",
      price: "Starting at $25/tire",
    },
    {
      icon: "⚖️",
      title: "Tire Balancing",
      description:
        "Computer-assisted wheel balancing to eliminate vibrations and ensure even tire wear. Smooth ride guaranteed.",
      price: "Starting at $15/tire",
    },
    {
      icon: "🔄",
      title: "Seasonal Tire Change",
      description:
        "Swap between summer and winter tires quickly and affordably. We store-and-swap to get you road-ready for any season.",
      price: "Call for pricing",
    },
  ];

  const getServiceCardClassName = (index) => {
    const isLastRowOfTwo = services.length % 3 === 2 && index >= services.length - 2;

    if (!isLastRowOfTwo) {
      return "opacity-0 animate-fade-in-up h-full lg:col-span-2";
    }

    return index === services.length - 2
      ? "opacity-0 animate-fade-in-up h-full lg:col-span-2 lg:col-start-2"
      : "opacity-0 animate-fade-in-up h-full lg:col-span-2 lg:col-start-4";
  };

  return (
    <div>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 bg-tire-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-tire-gray-dark/50 to-tire-black" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="section-heading text-white mb-4">
            Our <span className="text-tire-red">Services</span>
          </h1>
          <p className="section-subheading">
            Affordable, fast, and reliable tire services. No hidden fees — what
            we quote is what you pay.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-tire-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 stagger-children">
            {services.map((s, i) => (
              <div key={i} className={getServiceCardClassName(i)}>
                <ServiceCard {...s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-tire-gray-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="card border-tire-red/30 p-8 md:p-12">
            <div className="text-5xl mb-4">📞</div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
              Looking for a Specific Size?
            </h2>
            <p className="font-body text-gray-400 leading-relaxed mb-6">
              Our inventory changes daily. Give us a call and we'll let you know
              if we have your size and brand in stock. We carry most common
              sizes for cars, trucks, and SUVs.
            </p>
            <a href="tel:7732716009" className="btn-primary">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call (773) 271-6009
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-tire-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading text-white mb-4">
              How It <span className="text-tire-red">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Call Us",
                desc: "Tell us your tire size, vehicle type, and what you need. We'll check stock and give you a price.",
              },
              {
                step: "02",
                title: "Come In",
                desc: "Drive over to 5112 N Lincoln Ave. No appointment needed — walk-ins welcome.",
              },
              {
                step: "03",
                title: "Drive Out",
                desc: "Most services done in under an hour. You'll be back on the road fast.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="font-heading text-6xl font-bold text-tire-red/20 mb-2">
                  {item.step}
                </div>
                <h3 className="font-heading text-xl font-semibold text-white uppercase tracking-wide mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
