import express from "express";
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  confirmBankTransferPayment,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/verify/:reference", protect, verifyPayment);
router.get("/:id", protect, getOrderById);

router.get("/", protect, authorize("admin"), getAllOrders);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/confirm-payment", protect, authorize("admin"), confirmBankTransferPayment);

export default router;