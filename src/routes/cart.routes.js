import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMyCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cart.controller.js";

const router = Router();

router.get("/", requireAuth, getMyCart);
router.post("/", requireAuth, addToCart);
router.put("/", requireAuth, updateCartItem);
router.delete("/clear", requireAuth, clearCart);
router.delete("/:productId", requireAuth, removeCartItem);

export default router;
