import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createPaymentOrder,
  verifyPayment
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-order", requireAuth, createPaymentOrder);
router.post("/verify", requireAuth, verifyPayment);

export default router;
