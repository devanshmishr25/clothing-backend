import { z } from "zod";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ---------- Users ----------
export async function listUsers(req, res) {
  const { q, page = 1, limit = 10 } = req.query;

  // include users created before adding isActive
  const filter = {
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  };

  if (q && String(q).trim().length > 0) {
    filter.$and = [
      {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
}

const roleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export async function updateUserRole(req, res) {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid role", errors: parsed.error.errors });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: parsed.data.role },
    { new: true },
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
}
 
export async function deactivateUser(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ ok: true });
}

// ---------- Analytics ----------
export async function summary(req, res) {
  const [users, products, orders] = await Promise.all([
    User.countDocuments({
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: { $in: ["confirmed", "shipped", "delivered"] } } },
    { $group: { _id: null, revenue: { $sum: "$totals.grandTotal" } } },
  ]);

  const revenue = revenueAgg[0]?.revenue || 0;

  res.json({ users, products, orders, revenue });
}

export async function ordersByStatus(req, res) {
  const data = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json(data);
}

export async function salesLast7Days(req, res) {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        status: { $in: ["confirmed", "shipped", "delivered"] },
      },
    },
    {
      $group: {
        _id: {
          y: { $year: "$createdAt" },
          m: { $month: "$createdAt" },
          d: { $dayOfMonth: "$createdAt" },
        },
        orders: { $sum: 1 },
        sales: { $sum: "$totals.grandTotal" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
  ]);

  res.json(data);
}

// ---------- Dashboard ----------

export async function getDashboardStats(req, res) {
  try {
    // counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totals.grandTotal" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    // recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // low stock alert
    const lowStockProducts = await Product.find({
      stock: { $lt: 10 },
    }).select("title stock");

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        ordersToday,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error" });
  }
}
