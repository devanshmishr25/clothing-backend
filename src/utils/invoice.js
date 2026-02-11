import PDFDocument from "pdfkit";

export function generateInvoice(res, order) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  /* ---------- HEADER ---------- */
  doc
    .fontSize(20)
    .text("Clothing Store Invoice", { align: "center" })
    .moveDown();

  doc.fontSize(12);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
  doc.moveDown();

  /* ---------- CUSTOMER ---------- */
  doc.text("Billing Address:");
  doc.text(order.shippingAddress.fullName);
  doc.text(order.shippingAddress.line1);
  doc.text(
    `${order.shippingAddress.city}, ${order.shippingAddress.state}`
  );
  doc.text(`Pincode: ${order.shippingAddress.pincode}`);
  doc.moveDown();

  /* ---------- ITEMS ---------- */
  doc.text("Items:", { underline: true });
  doc.moveDown(0.5);

  let subtotal = 0;

  order.items.forEach((item) => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    doc.text(
      `${item.title}  | Qty: ${item.qty} | ₹${lineTotal}`
    );
  });

  doc.moveDown();

  /* ---------- TAX ---------- */
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  doc.text(`Subtotal: ₹${subtotal}`);
  doc.text(`GST (18%): ₹${gst.toFixed(2)}`);
  doc.text(`Total: ₹${grandTotal.toFixed(2)}`, {
    underline: true,
  });

  doc.moveDown();

  doc.text("Thank you for shopping with us!", {
    align: "center",
  });

  doc.end();
}
