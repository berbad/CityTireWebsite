import React from "react";

const About = () => {
  const values = [
    {
      icon: "🤝",
      title: "Integrity",
      desc: "Honest, upfront pricing. No surprises, no hidden fees.",
    },
    {
      icon: "🔍",
      title: "Quality",
      desc: "Every tire inspected to meet safety standards before sale.",
    },
    {
      icon: "❤️",
      title: "Customer Care",
      desc: "We treat every customer like family — because you are.",
    },
    {
      icon: "🏙️",
      title: "Community",
      desc: "Proudly serving Chicago with dedication and care since 2005.",
    },
  ];

  return (
    <div>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 bg-tire-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-tire-gray-dark/50 to-tire-black" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="section-heading text-white mb-4">
            About <span className="text-tire-red">City Tire</span>
          </h1>
          <p className="section-subheading">
            Family-owned. Community-driven. On the road with you since 2005.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-tire-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-6 font-body text-gray-300 text-lg leading-relaxed">
            <p>
              City Tire Repair Shop has been providing quality used tires to the
              Chicagoland area since 2005. As a family-owned business run by the
              Badel family, we're committed to offering affordable, reliable
              tire services while treating every customer like part of the
              family.
            </p>
            <p>
              Our mission is simple: help drivers save money with high-quality
              used tires while ensuring safety on the road. Whether you need a
              tire replacement, repair, or just some expert advice — our
              experienced team is here to help.
            </p>
            <p>
              Over the years we've built a reputation for honest pricing, fast
              service, and genuine care for the people who walk through our
              doors. That's why we're rated 4.5+ stars on Google with hundreds
              of reviews.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-tire-gray-dark relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading text-white mb-4">
              Our <span className="text-tire-red">Values</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {values.map((v, i) => (
              <div
                key={i}
                className="card text-center opacity-0 animate-fade-in-up"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-heading text-lg font-semibold text-white uppercase tracking-wide mb-2">
                  {v.title}
                </h3>
                <p className="font-body text-gray-400 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-tire-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="section-heading text-white text-center mb-12">
            Why Choose <span className="text-tire-red">Us?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Affordable Tires",
                desc: "Save money with top-quality used tires inspected for safety and tread life.",
                icon: "💰",
              },
              {
                title: "Expert Service",
                desc: "Skilled technicians with 20 years of experience ensure your vehicle is road-ready.",
                icon: "🔧",
              },
              {
                title: "Convenience",
                desc: "Fast, friendly service with no appointment needed. Most jobs done in under an hour.",
                icon: "⏱️",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-heading text-lg font-semibold text-white uppercase tracking-wide mb-2">
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

      <section className="py-16 md:py-20 bg-tire-red">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
            Come See Us
          </h2>
          <p className="font-body text-lg text-white/80 mb-8">
            Visit us at 5112 N Lincoln Ave, Chicago, or give us a call.
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
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
