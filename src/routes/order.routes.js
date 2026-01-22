import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createOrder,
  createOrderFromCart,
  myOrders,
  allOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";


const router = Router();

// User
router.post("/", requireAuth, createOrder);
router.post("/from-cart", requireAuth, createOrderFromCart);
router.get("/me", requireAuth, myOrders);

// Admin
router.get("/", requireAuth, requireRole("admin"), allOrders);
router.put("/:id/status", requireAuth, requireRole("admin"), updateOrderStatus);


export default router;
