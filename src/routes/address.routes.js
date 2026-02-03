import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from "../controllers/address.controller.js";

const router = Router();

router.get("/", requireAuth, getAddresses);
router.post("/", requireAuth, addAddress);
router.put("/:id", requireAuth, updateAddress);
router.delete("/:id", requireAuth, deleteAddress);

export default router;
