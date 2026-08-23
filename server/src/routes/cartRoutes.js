import express from "express";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.delete("/", clearCart);

router.post("/items", addCartItem);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);

export default router;