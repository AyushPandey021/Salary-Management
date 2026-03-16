import express from "express";
import {
 addTransaction,
 getTransactions,
 getSummary,
 getRecentTransactions,
 updateTransaction,
 deleteTransaction
} from "../controllers/transaction.controllers.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions", verifyToken, addTransaction);

router.get("/transactions", verifyToken, getTransactions);

router.get("/transactions/summary", verifyToken, getSummary);

router.get("/transactions/recent", verifyToken, getRecentTransactions);

router.put("/transactions/:id", verifyToken, updateTransaction);

router.delete("/transactions/:id", verifyToken, deleteTransaction);

export default router;