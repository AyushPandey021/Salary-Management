import express from "express";
import {
  addTransaction,
  getTransactions
} from "../controllers/transaction.controllers.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions", verifyToken, addTransaction);

router.get("/transactions", verifyToken, getTransactions);

export default router;