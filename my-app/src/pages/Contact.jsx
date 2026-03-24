import React, { useState } from "react";
import axios from "axios";
import Hours from "../Components/Hours";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    axios
      .post("https://formspree.io/f/xeojyjve", formData)
      .then(() => {
        setFormStatus("success");
        setIsSubmitting(false);
        setFormData({ name: "", email: "", phone: "", message: "" });
      })
      .catch(() => {
        setFormStatus("error");
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 bg-tire-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-tire-gray-dark/50 to-tire-black" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="section-heading text-white mb-4">
            Contact <span className="text-tire-red">Us</span>
          </h1>
          <p className="section-subheading">
            Have questions? Need a quote? Reach out — we're here to help.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-tire-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="card p-8">
              <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wide mb-6">
                Send Us a Message
              </h2>

              {formStatus === "success" && (
                <div className="bg-green-900/30 border border-green-700 text-green-400 font-body text-sm rounded-sm px-4 py-3 mb-6">
                  Thank you! We'll get back to you shortly.
                </div>
              )}
              {formStatus === "error" && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 font-body text-sm rounded-sm px-4 py-3 mb-6">
                  Something went wrong. Please try again or call us directly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-heading text-xs uppercase tracking-[0.15em] text-gray-400 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-tire-gray-mid border border-tire-gray-light rounded-sm px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-tire-red transition-colors placeholder-gray-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block font-heading text-xs uppercase tracking-[0.15em] text-gray-400 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-tire-gray-mid border border-tire-gray-light rounded-sm px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-tire-red transition-colors placeholder-gray-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block font-heading text-xs uppercase tracking-[0.15em] text-gray-400 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-tire-gray-mid border border-tire-gray-light rounded-sm px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-tire-red transition-colors placeholder-gray-500"
                    placeholder="(xxx) xxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block font-heading text-xs uppercase tracking-[0.15em] text-gray-400 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full bg-tire-gray-mid border border-tire-gray-light rounded-sm px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-tire-red transition-colors placeholder-gray-500 resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="card p-8">
                <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wide mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-5">
                  <a
                    href="tel:7732716009"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-tire-red/10 border border-tire-red/30 rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-tire-red/20 transition-colors">
                      <svg
                        className="w-5 h-5 text-tire-red"
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
                    </div>
                    <div>
                      <div className="font-heading text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">
                        Phone
                      </div>
                      <div className="font-body text-white text-lg group-hover:text-tire-red transition-colors">
                        (773) 271-6009
                      </div>
                    </div>
                  </a>

                  <a
                    href="mailto:citytirerepairshop5112@gmail.com"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-tire-red/10 border border-tire-red/30 rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-tire-red/20 transition-colors">
                      <svg
                        className="w-5 h-5 text-tire-red"
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
                    </div>
                    <div>
                      <div className="font-heading text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">
                        Email
                      </div>
                      <div className="font-body text-gray-300 text-sm group-hover:text-white transition-colors break-all">
                        citytirerepairshop5112@gmail.com
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://maps.google.com/?q=City+Tire+Repair+Shop+5112+N+Lincoln+Ave+Chicago+IL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-tire-red/10 border border-tire-red/30 rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-tire-red/20 transition-colors">
                      <svg
                        className="w-5 h-5 text-tire-red"
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
                    </div>
                    <div>
                      <div className="font-heading text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">
                        Address
                      </div>
                      <div className="font-body text-gray-300 text-sm group-hover:text-white transition-colors">
                        5112 N Lincoln Ave, Chicago, IL 60625
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="card p-8">
                <h3 className="font-heading text-xl font-bold text-white uppercase tracking-wide mb-6">
                  Hours of Operation
                </h3>
                <Hours compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-tire-gray-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-sm overflow-hidden border border-tire-gray-light">
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

export default Contact;
