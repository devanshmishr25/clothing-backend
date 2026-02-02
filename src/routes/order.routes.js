import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { updateOrderStatus } from "../controllers/order.controller.js";

import {
  createCodOrderFromCart,
  myOrders,
  getMyOrderById,
  allOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";

const router = Router();

// USER (COD)
router.post("/cod/from-cart", requireAuth, createCodOrderFromCart);
router.get("/me", requireAuth, myOrders);
router.get("/me/:id", requireAuth, getMyOrderById);

// ADMIN
router.get("/", requireAuth, requireRole("admin"), allOrders);
router.put("/:id/status", requireAuth, requireRole("admin"), updateOrderStatus);

export default router;
