import { Router } from "express";
import { listCategories, createCategory } from "../controllers/category.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories);
router.post("/", requireAuth, requireRole("admin"), createCategory);

export default router;
