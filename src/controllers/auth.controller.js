import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", errors: parsed.error.errors });
  }

  const { name, email, password } = parsed.data;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", errors: parsed.error.errors });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function logout(req, res) {
  res.json({
    message: "Logged out successfully",
  });
}
