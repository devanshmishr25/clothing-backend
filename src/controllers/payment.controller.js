import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("⚠ Razorpay keys not found. Payment disabled.");
}


// Create payment order
export async function createPaymentOrder(req, res) {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!razorpay) {
    return res.status(500).json({ message: "Payment gateway not configured" });
  }

  if (!order) return res.status(404).json({ message: "Order not found" });

  const options = {
    amount: order.totals.grandTotal * 100,
    currency: "INR",
    receipt: order._id.toString(),
  };

  const rzpOrder = await razorpay.orders.create(options);

  res.json({
    orderId: rzpOrder.id,
    amount: options.amount,
    key: process.env.RAZORPAY_KEY_ID,
  });
}

// Verify payment
export async function verifyPayment(req, res) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid payment" });
  }

  const order = await Order.findById(orderId);

  order.payment = {
    method: "online",
    status: "paid",
    paymentId: razorpay_payment_id,
  };

  order.status = "confirmed";
  await order.save();

  res.json({ message: "Payment successful" });
}
