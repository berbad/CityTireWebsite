import React from "react";
import { Link } from "react-router-dom";
import FeatureCard from "../Components/Featurecard";
import Hours from "../Components/Hours";

const Home = () => {
  const services = [
    {
      icon: "🛞",
      title: "Used Tires",
      desc: "Quality inspected used tires at unbeatable prices.",
    },
    {
      icon: "🔧",
      title: "Tire Repair",
      desc: "Patching, plugs, and puncture repair while you wait.",
    },
    {
      icon: "⚙️",
      title: "Installation",
      desc: "Professional tire mounting and balancing.",
    },
    {
      icon: "🔄",
      title: "Seasonal Swap",
      desc: "Quick summer-to-winter tire changeovers.",
    },
  ];

  const features = [
    {
      icon: "⚡",
      title: "Fast Service",
      description:
        "Get in and out quickly. Most services completed while you wait.",
    },
    {
      icon: "🏆",
      title: "4.5★ on Google",
      description: "Hundreds of 5-star reviews from satisfied Chicago drivers.",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Family Owned",
      description:
        "Run by the Badel family for 15+ years. Our customers are family.",
    },
    {
      icon: "🛡️",
      title: "Since 2005",
      description: "20 years serving Chicagoland with honesty and expertise.",
    },
  ];

  return (
    <div>
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tire-black via-tire-gray-dark to-tire-black" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tire-red/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tire-red/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />

        <div className="absolute top-0 right-[15%] w-1 h-full bg-gradient-to-b from-transparent via-tire-red/20 to-transparent rotate-12 hidden md:block" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 md:py-40 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-tire-red/10 border border-tire-red/30 rounded-sm px-4 py-1.5 mb-6 animate-fade-in-up">
              <span className="w-2 h-2 bg-tire-red rounded-full animate-pulse" />
              <span className="font-body text-xs text-tire-red uppercase tracking-[0.2em] font-semibold">
                Chicago's Trusted Tire Shop Since 2005
              </span>
            </div>

            <h1
              className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              AFFORDABLE
              <br />
              <span className="text-tire-red">USED TIRES</span>
              <br />
              NEAR YOU
            </h1>

            <p
              className="font-body text-lg sm:text-xl text-gray-400 max-w-lg leading-relaxed mb-10 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              Quality used tires, expert repair, and fast service — all at
              prices that won't break the bank. Call us to check availability.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.45s" }}
            >
              <a href="tel:7732716009" className="btn-primary text-center">
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
                Call Now
              </a>
              <a
                href="https://maps.google.com/?q=City+Tire+Repair+Shop+5112+N+Lincoln+Ave+Chicago+IL"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-center"
              >
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Get Directions
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-gray-500">
          <span className="font-body text-[10px] uppercase tracking-[0.3em]">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-tire-black relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tire-red/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading text-white mb-4">
              What We <span className="text-tire-red">Do</span>
            </h2>
            <p className="section-subheading">
              Fast, affordable tire services to keep you rolling. Call us to
              check sizes and availability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {services.map((s, i) => (
              <div
                key={i}
                className="card text-center group opacity-0 animate-fade-in-up"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {s.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-white uppercase tracking-wide mb-2">
                  {s.title}
                </h3>
                <p className="font-body text-gray-400 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className="btn-outline">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-tire-gray-dark relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading text-white mb-4">
              Why <span className="text-tire-red">City Tire?</span>
            </h2>
            <p className="section-subheading">
              Trusted by thousands of Chicago drivers for two decades.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-tire-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="section-heading text-white mb-4">
            Hours of <span className="text-tire-red">Operation</span>
          </h2>
          <p className="section-subheading mb-10">
            Today's day is highlighted. Walk-ins welcome — no appointment
            needed.
          </p>
          <Hours />
        </div>
      </section>

      <section className="py-16 md:py-20 bg-tire-red relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white uppercase tracking-tight mb-4">
            Need Tires Today?
          </h2>
          <p className="font-body text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Call us to check sizes, brands, and pricing. Most installations done
            in under an hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:7732716009"
              className="inline-flex items-center justify-center gap-2 bg-white text-tire-red font-heading text-lg uppercase tracking-wider px-8 py-4 rounded-sm hover:bg-gray-100 transition-colors font-bold"
            >
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
              (773) 271-6009
            </a>
            <a
              href="https://maps.google.com/?q=City+Tire+Repair+Shop+5112+N+Lincoln+Ave+Chicago+IL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-heading text-lg uppercase tracking-wider px-8 py-4 rounded-sm hover:bg-white hover:text-tire-red transition-colors font-bold"
            >
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-tire-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="section-heading text-white mb-4">
            Find <span className="text-tire-red">Us</span>
          </h2>
          <p className="section-subheading mb-10">
            5112 N Lincoln Ave, Chicago, IL 60625
          </p>
          <div className="rounded-sm overflow-hidden border border-tire-gray-light max-w-4xl mx-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d95041.53679818039!2d-87.74749819058175!3d41.891824247703575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fd202219a6895%3A0xe8e41d6410137d1b!2sCity%20Tire%20Repair%20Shop!5e0!3m2!1sen!2sus!4v1724962481912!5m2!1sen!2sus"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="City Tire Repair Shop Location"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
