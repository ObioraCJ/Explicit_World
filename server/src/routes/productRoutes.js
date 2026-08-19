import express from "express";
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  addProductReview,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  validate,
  createProductValidation,
  reviewValidation,
} from "../middleware/validate.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// Admin-only routes
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  createProductValidation,
  validate,
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, authorize("admin"), deleteProduct);

// Logged-in customer route
router.post("/:id/reviews", protect, reviewValidation, validate, addProductReview);

export default router;