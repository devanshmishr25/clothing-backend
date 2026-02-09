import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadImage, deleteImage, uploadMultipleImages } from "../controllers/upload.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Single upload
router.post(
  "/multiple",
  requireAuth,
  requireRole("admin"),
  upload.array("images", 6), // max 6 images
  uploadMultipleImages
);

// Delete by publicId (URL encoded)
router.delete("/:publicId", requireAuth, requireRole("admin"), deleteImage);

export default router;
