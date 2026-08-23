import express from "express";
import {
  createCustomOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/customOrderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  validate,
  createCustomOrderValidation,
  updateOrderStatusValidation,
} from "../middleware/validate.js";

const router = express.Router();

// Customer routes
router.post(
  "/",
  protect,
  upload.array("styleReferenceImages", 5),
  createCustomOrderValidation,
  validate,
  createCustomOrder
);
router.get("/my-orders", protect, getMyOrders);
router.put("/:id/cancel", protect, cancelOrder);

// Shared route - access control handled inside the controller based on role
router.get("/:id", protect, getOrderById);

// Admin/Tailor routes
router.get("/", protect, authorize("admin", "tailor"), getAllOrders);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "tailor"),
  updateOrderStatusValidation,
  validate,
  updateOrderStatus
);

export default router;