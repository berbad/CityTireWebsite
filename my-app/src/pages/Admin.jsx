import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import jsPDF from 'jspdf';
import '../Styles/Styles.css';

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

    const [date, setDate] = useState(new Date().toLocaleDateString());

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleServiceChange = (e) => {
        const { name, value } = e.target;
        setServices(prevServices => ({
            ...prevServices,
            [name]: value === "" ? "" : parseInt(value) || 0
        }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text("Receipt", 20, 20);
        doc.text(`Date: ${date}`, 20, 30);
        doc.text("City Tire Repair Shop", 20, 40);
    
        let yPosition = 50;
        Object.entries(services).forEach(([service, quantity]) => {
            quantity = quantity === "" ? 0 : quantity;
            if (quantity > 0) {
                const serviceName = service.replace(/([A-Z])/g, ' $1').toLowerCase();
                doc.text(`${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}: ${quantity}`, 20, yPosition);
                yPosition += 10;
            }
        });
    
        doc.save('receipt.pdf');
    };
    

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="admin-main-container">
                    <h2>Admin Dashboard</h2>
                    <p>Welcome to the admin panel. You are logged in!</p>

                    <div className="form-container">
                        <h3>Create a Receipt</h3>
                        <div>
                            <label>City Tire Repair Shop</label>
                        </div>
                        <h4>Services</h4>
                        <div>
                            <label>New Tires:</label>
                            <input
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                name="newTires"
                                value={services.newTires}
                                onChange={handleServiceChange}
                                placeholder="0"
                            />
                        </div>
                        {/* Repeat for other inputs */}
                        <div>
                            <label>Used Tires:</label>
                            <input
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                name="usedTires"
                                value={services.usedTires}
                                onChange={handleServiceChange}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>Brakes:</label>
                            <input
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                name="brakes"
                                value={services.brakes}
                                onChange={handleServiceChange}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>Rotation:</label>
                            <input
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                name="rotation"
                                value={services.rotation}
                                onChange={handleServiceChange}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>Plugging Tire:</label>
                            <input
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                name="plugging"
                                value={services.plugging}
                                onChange={handleServiceChange}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>Balance: $</label>
                            <input
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                name="balance"
                                value={services.balance}
                                onChange={handleServiceChange}
                                placeholder="0"
                            />
                        </div>
                        <button onClick={generatePDF}>Download Receipt</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Admin;