import { z } from "zod";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ---------- Users ----------
export async function listUsers(req, res) {
  const { q, page = 1, limit = 10 } = req.query;

  // include users created before adding isActive
  const filter = {
    $or: [{ isActive: true }, { isActive: { $exists: false } }]
  };

  if (q && String(q).trim().length > 0) {
    filter.$and = [
      {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } }
        ]
      }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter)
  ]);

  res.json({
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit))
  });
}

const roleSchema = z.object({
  role: z.enum(["user", "admin"])
});

export async function updateUserRole(req, res) {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid role", errors: parsed.error.errors });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: parsed.data.role },
    { new: true }
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
}

export async function deactivateUser(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ ok: true });
}

// ---------- Analytics ----------
export async function summary(req, res) {
  const [users, products, orders] = await Promise.all([
    User.countDocuments({ $or: [{ isActive: true }, { isActive: { $exists: false } }] }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments()
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: { $in: ["confirmed", "shipped", "delivered"] } } },
    { $group: { _id: null, revenue: { $sum: "$totals.grandTotal" } } }
  ]);

  const revenue = revenueAgg[0]?.revenue || 0;

  res.json({ users, products, orders, revenue });
}

export async function ordersByStatus(req, res) {
  const data = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json(data);
}

export async function salesLast7Days(req, res) {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $in: ["confirmed", "shipped", "delivered"] } } },
    {
      $group: {
        _id: {
          y: { $year: "$createdAt" },
          m: { $month: "$createdAt" },
          d: { $dayOfMonth: "$createdAt" }
        },
        orders: { $sum: 1 },
        sales: { $sum: "$totals.grandTotal" }
      }
    },
    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } }
  ]);

  res.json(data);
}
