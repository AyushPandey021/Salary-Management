import express from "express";
import {
  addTransaction,
  getRecentTransactions,
  getSummary,
  getTransactions,
  getTransactionsByMonth
} from "../controllers/transaction.controllers.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions", verifyToken, addTransaction);

router.get("/transactions", verifyToken, getTransactions);


router.get("/transactions/summary", verifyToken, getSummary);
router.get("/transactions/recent", verifyToken, getRecentTransactions);
router.get("/transactions/month", verifyToken, getTransactionsByMonth);

export default router;  