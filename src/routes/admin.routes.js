import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listUsers,
  updateUserRole,
  deactivateUser,
  summary,
  ordersByStatus,
  salesLast7Days
} from "../controllers/admin.controller.js";

const router = Router();

// Users
router.get("/users", requireAuth, requireRole("admin"), listUsers);
router.put("/users/:id/role", requireAuth, requireRole("admin"), updateUserRole);
router.delete("/users/:id", requireAuth, requireRole("admin"), deactivateUser);

// Analytics
router.get("/analytics/summary", requireAuth, requireRole("admin"), summary);
router.get("/analytics/orders-by-status", requireAuth, requireRole("admin"), ordersByStatus);
router.get("/analytics/sales-last-7-days", requireAuth, requireRole("admin"), salesLast7Days);

export default router;
