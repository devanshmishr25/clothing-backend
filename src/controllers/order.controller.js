import { z } from "zod";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// ------------INVOICE-------------
import { generateInvoice } from "../utils/invoice.js";

// ---------- VALIDATION ----------
const shippingSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4)
});

const createFromCartSchema = z.object({
  shippingAddress: shippingSchema
});

// ---------- USER: COD CHECKOUT FROM CART ----------
export async function createCodOrderFromCart(req, res) {
  const parsed = createFromCartSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
  }

  const { shippingAddress } = parsed.data;

  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Build order items + check stock
  let subtotal = 0;
  const finalItems = [];

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      return res.status(400).json({ message: "Invalid product in cart" });
    }

    if (product.stock < item.qty) {
      return res.status(400).json({ message: `Out of stock: ${product.title}` });
    }

    subtotal += product.price * item.qty;

    finalItems.push({
      product: product._id,
      title: product.title,
      price: product.price,
      qty: item.qty,
      size: item.size || "",
      color: item.color || "",
      image: product.images?.[0]?.url || ""
    });
  }

  // Shipping rule (edit as you want)
  const shipping = subtotal >= 999 ? 0 : 49;
  const discount = 0;
  const grandTotal = subtotal + shipping - discount;

  // Reduce stock (simple approach)
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.qty } });
  }

  // Create COD order
  const order = await Order.create({
    user: req.user.id,
    items: finalItems,
    shippingAddress,
    totals: { subtotal, shipping, discount, grandTotal },
    payment: { method: "cod", status: "pending" },
    status: "pending",
    statusHistory: [{ status: "pending" }]
  });

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
}

// USER cancel order
export async function cancelOrder(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!order)
    return res.status(404).json({ message: "Order not found" });

  // Cannot cancel after shipped
  if (["shipped", "delivered"].includes(order.status)) {
    return res
      .status(400)
      .json({ message: "Order cannot be cancelled now" });
  }

  // Already cancelled
  if (order.status === "cancelled") {
    return res
      .status(400)
      .json({ message: "Order already cancelled" });
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.qty }
    });
  }

  order.status = "cancelled";
  order.statusHistory.push({ status: "cancelled" });

  await order.save();

  res.json({ message: "Order cancelled", order });
}

// ---------- USER ----------
export async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
}

export async function getMyOrderById(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
}

// ---------- ADMIN ----------
export async function allOrders(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments()
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])
});

// Admin update status (and restore stock on cancel)
export async function updateOrderStatus(req, res) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid status", errors: parsed.error.errors });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const newStatus = parsed.data.status;

  // Restore stock if cancelled
  if (newStatus === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }
  }

  order.status = newStatus;

  // COD becomes paid after delivery
  if (newStatus === "delivered" && order.payment.method === "cod") {
    order.payment.status = "paid";
  }

  order.statusHistory.push({ status: newStatus });

  await order.save();

  res.json(order);
}

export async function downloadInvoice(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  generateInvoice(res, order);
}
