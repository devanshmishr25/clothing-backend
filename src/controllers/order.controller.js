import { z } from "zod";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string(),
        qty: z.number().int().positive(),
        size: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .min(1),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    line1: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
  }),
  paymentMethod: z.enum(["cod", "online"]).default("cod"),
});

export async function createOrder(req, res) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", errors: parsed.error.errors });
  }

  const { items, shippingAddress, paymentMethod } = parsed.data;

  // Compute totals + snapshot items
  let subtotal = 0;
  const finalItems = [];

  for (const i of items) {
    const product = await Product.findById(i.product);
    if (!product || !product.isActive) {
      return res.status(400).json({ message: "Invalid product in cart" });
    }
    if (product.stock < i.qty) {
      return res
        .status(400)
        .json({ message: `Out of stock: ${product.title}` });
    }

    subtotal += product.price * i.qty;

    finalItems.push({
      product: product._id,
      title: product.title,
      price: product.price,
      qty: i.qty,
      size: i.size || "",
      color: i.color || "",
      image: product.images?.[0]?.url || "",
    });
  }

  // Example shipping rule
  const shipping = subtotal >= 999 ? 0 : 49;
  const discount = 0;
  const grandTotal = subtotal + shipping - discount;

  // Reduce stock
  for (const i of items) {
    await Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.qty } });
  }

  const order = await Order.create({
    user: req.user.id,
    items: finalItems,
    shippingAddress,
    totals: { subtotal, shipping, discount, grandTotal },
    payment: { method: paymentMethod, status: "pending" },
    status: "pending",
  });

  res.status(201).json(order);
}

export async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
}

// Admin
export async function allOrders(req, res) {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body; // confirmed/shipped/delivered/cancelled
  const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
}

export async function createOrderFromCart(req, res) {
  // get cart + product details
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const { shippingAddress, paymentMethod = "cod" } = req.body;

  // basic validation (simple)
  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.phone ||
    !shippingAddress?.line1 ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.pincode
  ) {
    return res.status(400).json({ message: "Shipping address is required" });
  }

  let subtotal = 0;
  const finalItems = [];

  // build items + check stock
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

  // shipping rule (you can change)
  const shipping = subtotal >= 999 ? 0 : 49;
  const discount = 0;
  const grandTotal = subtotal + shipping - discount;

  // reduce stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.qty } });
  }

  // create order
  const order = await Order.create({
    user: req.user.id,
    items: finalItems,
    shippingAddress,
    totals: { subtotal, shipping, discount, grandTotal },
    payment: { method: paymentMethod, status: "pending" },
    status: "pending"
  });

  // clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
}
