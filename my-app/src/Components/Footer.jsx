import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tire-black border-t border-tire-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-tire-red rounded-sm flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="3" x2="12" y2="8" />
                  <line x1="12" y1="16" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="8" y2="12" />
                  <line x1="16" y1="12" x2="21" y2="12" />
                </svg>
              </div>
              <span className="font-heading text-lg font-bold text-white tracking-wider">
                CITY TIRE
              </span>
            </div>
            <p className="text-gray-400 font-body text-sm leading-relaxed max-w-xs">
              Family-owned tire shop serving the Chicagoland area since 2005.
              Affordable used tires, expert repairs, and fast service.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-tire-red mb-4">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-400 hover:text-white text-sm font-body transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-tire-red mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-3 text-sm font-body">
              <a
                href="tel:7732716009"
                className="text-white hover:text-tire-red transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-tire-red flex-shrink-0"
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
                href="mailto:citytirerepairshop5112@gmail.com"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-tire-red flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                citytirerepairshop5112@gmail.com
              </a>
              <div className="text-gray-400 flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-tire-red flex-shrink-0 mt-0.5"
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
                5112 N Lincoln Ave
                <br />
                Chicago, IL 60625
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-tire-gray-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs font-body">
            &copy; {currentYear} City Tire Repair Shop. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs font-body">
            Serving Chicago &amp; the Chicagoland area since 2005
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
