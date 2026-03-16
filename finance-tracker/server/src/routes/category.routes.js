import express from "express";
import Category from "../models/category.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/* DEFAULT CATEGORIES */

const defaultCategories = {
  Expense: [
    { title: "Food", emoji: "🍔", type: "Expense" },
    { title: "Travel", emoji: "🚗", type: "Expense" },
    { title: "Shopping", emoji: "🛒", type: "Expense" },
    { title: "Bills", emoji: "💡", type: "Expense" }
  ],

  Income: [
    { title: "Salary", emoji: "💰", type: "Income" },
    { title: "Bonus", emoji: "🎁", type: "Income" },
    { title: "Freelance", emoji: "💻", type: "Income" }
  ],

  Investment: [
    { title: "Stocks", emoji: "📈", type: "Investment" },
    { title: "Crypto", emoji: "🪙", type: "Investment" },
    { title: "Mutual Fund", emoji: "🏦", type: "Investment" }
  ]
};


/* GET CATEGORY BY TYPE */

router.get("/:type", verifyToken, async (req, res) => {

  try {

    const userId = req.user.id || req.user._id;

    const type = req.params.type;

    /* user categories from database */

    const userCategories = await Category.find({
      type,
      userId
    }).sort({ createdAt: -1 });


    /* default categories */

    const defaults = defaultCategories[type] || [];


    /* convert defaults to same format */

    const formattedDefaults = defaults.map((cat, index) => ({
      _id: `default-${index}`,
      title: cat.title,
      emoji: cat.emoji,
      type: cat.type,
      isDefault: true
    }));


    /* merge default + user */

    const allCategories = [...formattedDefaults, ...userCategories];


    res.json(allCategories);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch categories"
    });

  }

});


/* CREATE CATEGORY */

router.post("/", verifyToken, async (req, res) => {

  try {

    const { title, emoji, type } = req.body;

    const userId = req.user.id || req.user._id;

    const category = await Category.create({
      title,
      emoji,
      type,
      userId
    });

    res.json(category);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to create category"
    });

  }

});


/* UPDATE CATEGORY */

router.put("/:id", verifyToken, async (req, res) => {

  try {

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Update failed"
    });

  }

});


/* DELETE CATEGORY */

router.delete("/:id", verifyToken, async (req, res) => {

  try {

    await Category.findByIdAndDelete(req.params.id);

    res.json({ success: true });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Delete failed"
    });

  }

});


export default router;