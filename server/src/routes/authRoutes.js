import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../middleware/validate.js";

const router = express.Router();

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logoutUser);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.post("/forgot-password", forgotPasswordValidation, validate, forgotPassword);
router.put("/reset-password/:token", resetPasswordValidation, validate, resetPassword);

export default router;