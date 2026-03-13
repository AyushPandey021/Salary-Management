import express from "express";
import { login, signup,getCurrentUser } from "../controllers/auth.controllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", signup);
router.get("/me", verifyToken, getCurrentUser);
export default router;