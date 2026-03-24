import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path) => {
    if (path === "/")
      return location.pathname === "/" || location.pathname === "/home";
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-tire-black/95 backdrop-blur-md shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-tire-red rounded-sm flex items-center justify-center transition-transform group-hover:scale-110">
              <img
                src={`${process.env.PUBLIC_URL}/o.jpg`}
                alt="City Tire Shop logo"
                className="w-full h-full rounded-sm object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading text-xl font-bold text-white tracking-wider">
                CITY TIRE
              </span>
              <span className="block text-[10px] font-body text-gray-400 tracking-[0.2em] uppercase -mt-1">
                Repair Shop
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-heading text-sm uppercase tracking-[0.15em] px-4 py-2 rounded-sm transition-all duration-200 ${
                  isActive(link.to)
                    ? "text-tire-red"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:7732716009"
              className="ml-4 flex items-center gap-2 bg-tire-red text-white font-heading text-sm uppercase tracking-wider px-5 py-2.5 rounded-sm hover:bg-tire-red-dark transition-colors"
            >
              <svg
                className="w-4 h-4"
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
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-white"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-tire-gray-light">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-heading text-base uppercase tracking-[0.15em] px-4 py-3 rounded-sm transition-colors ${
                  isActive(link.to)
                    ? "text-tire-red bg-tire-gray-dark"
                    : "text-gray-300 hover:text-white hover:bg-tire-gray-dark"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 px-4 pt-3 border-t border-tire-gray-light">
              <div className="text-gray-400 font-body text-sm">
                5112 N Lincoln Ave, Chicago, IL 60625
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
