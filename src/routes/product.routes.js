import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  addReview,
  getReviews
} from "../controllers/review.controller.js";

const router = Router();

// Public
router.get("/", listProducts);
router.get("/:slug", getProduct);

// Admin
router.post("/", requireAuth, requireRole("admin"), createProduct);
router.put("/:id", requireAuth, requireRole("admin"), updateProduct);
router.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);

//Reviews
router.post("/:id/review", requireAuth, addReview);
router.get("/:id/reviews", getReviews);

export default router;
