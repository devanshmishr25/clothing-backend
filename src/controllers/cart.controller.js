import { z } from "zod";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export async function getMyCart(req, res) {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(cart || { user: req.user.id, items: [] });
}

const addSchema = z.object({
  product: z.string(),
  qty: z.number().int().positive().default(1),
  size: z.string().optional(),
  color: z.string().optional()
});

export async function addToCart(req, res) {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });

  const { product, qty, size = "", color = "" } = parsed.data;

  const prod = await Product.findById(product);
  if (!prod || !prod.isActive) return res.status(400).json({ message: "Invalid product" });

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

  // same product + same variant (size+color) should merge
  const index = cart.items.findIndex(
    (i) => i.product.toString() === product && i.size === size && i.color === color
  );

  if (index >= 0) {
    cart.items[index].qty += qty;
  } else {
    cart.items.push({ product, qty, size, color });
  }

  await cart.save();
  const populated = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.status(201).json(populated);
}

const updateSchema = z.object({
  product: z.string(),
  qty: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional()
});

export async function updateCartItem(req, res) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });

  const { product, qty, size = "", color = "" } = parsed.data;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const index = cart.items.findIndex(
    (i) => i.product.toString() === product && i.size === size && i.color === color
  );

  if (index < 0) return res.status(404).json({ message: "Item not found" });

  cart.items[index].qty = qty;

  await cart.save();
  const populated = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(populated);
}

export async function removeCartItem(req, res) {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);

  await cart.save();
  const populated = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(populated);
}

export async function clearCart(req, res) {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.json({ ok: true });

  cart.items = [];
  await cart.save();
  res.json({ ok: true });
}
