import { z } from "zod";
import Category from "../models/Category.js";

const createSchema = z.object({ name: z.string().min(2) });

export async function listCategories(req, res) {
  const items = await Category.find().sort({ name: 1 });
  res.json(items);
}

export async function createCategory(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
  }

  const exists = await Category.findOne({ name: parsed.data.name });
  if (exists) return res.status(409).json({ message: "Category already exists" });

  const created = await Category.create({ name: parsed.data.name });
  res.status(201).json(created);
}
