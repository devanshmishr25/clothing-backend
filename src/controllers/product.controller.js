import { z } from "zod";
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";


const createSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  mrp: z.number().nonnegative().optional(),
  images: z.array(z.object({ url: z.string().url() })).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative().optional()
});

export async function listProducts(req, res) {
  const { q, category, minPrice, maxPrice, size, color, page = 1, limit = 12 } = req.query;

  const filter = { isActive: true };

  if (q) filter.title = { $regex: q, $options: "i" };
  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {})
    };
  }

  if (size) filter.sizes = size;
  if (color) filter.colors = color;

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Product.find(filter).populate("category", "name").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function getProduct(req, res) {
  const item = await Product.findOne({ slug: req.params.slug, isActive: true }).populate("category", "name");
  if (!item) return res.status(404).json({ message: "Product not found" });
  res.json(item);
}

export async function createProduct(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
  }

  const exists = await Product.findOne({ slug: parsed.data.slug });
  if (exists) return res.status(409).json({ message: "Slug already exists" });

  const created = await Product.create(parsed.data);
  res.status(201).json(created);
}

export async function updateProduct(req, res) {
  const item = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Product not found" });
  res.json(item);
}

export async function deleteProduct(req, res) {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Product not found" });

  // Soft delete product
  item.isActive = false;
  await item.save();

  // ✅ Auto-delete images from Cloudinary
  const publicIds = (item.images || [])
    .map((img) => img.publicId)
    .filter(Boolean);

  for (const pid of publicIds) {
    try {
      await cloudinary.uploader.destroy(pid, { resource_type: "image" });
    } catch (e) {
      // ignore cloudinary failures so product delete still succeeds
    }
  }

  res.json({ ok: true });
}

