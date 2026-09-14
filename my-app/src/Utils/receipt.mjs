import { jsPDF } from "jspdf";

// Use text primitives only; receipt content never enters jsPDF HTML rendering.
export function createReceipt(services, date) {
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

    return doc;
}
