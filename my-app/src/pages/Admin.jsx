import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

function Admin() {
  const navigate = useNavigate();

  const [services, setServices] = useState({
    newTires: 0,
    usedTires: 0,
    brakes: 0,
    rotation: 0,
    balance: 0,
    plugging: 0,
  });

  const [date] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServices((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseInt(value) || 0,
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("City Tire Repair Shop", 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("5112 N Lincoln Ave, Chicago, IL 60625", 20, 28);
    doc.text("(773) 271-6009", 20, 34);

    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    doc.setFont("helvetica", "bold");
    doc.text("Receipt", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${date}`, 20, 58);

    let yPosition = 72;
    Object.entries(services).forEach(([service, quantity]) => {
      quantity = quantity === "" ? 0 : quantity;
      if (quantity > 0) {
        const serviceName = service.replace(/([A-Z])/g, " $1").toLowerCase();
        doc.text(
          `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}: ${quantity}`,
          20,
          yPosition,
        );
        yPosition += 10;
      }
    });

    doc.save("receipt.pdf");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const serviceFields = [
    { name: "newTires", label: "New Tires" },
    { name: "usedTires", label: "Used Tires" },
    { name: "brakes", label: "Brakes" },
    { name: "rotation", label: "Rotation" },
    { name: "plugging", label: "Plugging" },
    { name: "balance", label: "Balance" },
  ];

  return (
    <div className="min-h-screen bg-tire-black pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-wide">
              Admin Dashboard
            </h1>
            <p className="font-body text-gray-400 text-sm mt-1">
              Welcome back. Create receipts below.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="font-heading text-xs uppercase tracking-[0.15em] text-gray-400 hover:text-tire-red transition-colors border border-tire-gray-light hover:border-tire-red rounded-sm px-4 py-2"
          >
            Logout
          </button>
        </div>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-tire-red/10 border border-tire-red/30 rounded-sm flex items-center justify-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white uppercase tracking-wide">
                Create Receipt
              </h2>
              <p className="font-body text-gray-500 text-xs">{date}</p>
            </div>
          </div>

          <div className="space-y-4">
            {serviceFields.map((field) => (
              <div
                key={field.name}
                className="flex items-center justify-between gap-4"
              >
                <label className="font-heading text-sm uppercase tracking-[0.1em] text-gray-300 flex-shrink-0">
                  {field.label}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name={field.name}
                  value={services[field.name]}
                  onChange={handleServiceChange}
                  placeholder="0"
                  className="w-24 bg-tire-gray-mid border border-tire-gray-light rounded-sm px-3 py-2 text-white font-body text-sm text-center focus:outline-none focus:border-tire-red transition-colors placeholder-gray-600"
                />
              </div>
            ))}
          </div>

          <button onClick={generatePDF} className="btn-primary w-full mt-8">
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
