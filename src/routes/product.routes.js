import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", listProducts);
router.get("/:slug", getProduct);

// Admin
router.post("/", requireAuth, requireRole("admin"), createProduct);
router.put("/:id", requireAuth, requireRole("admin"), updateProduct);
router.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);

export default router;
