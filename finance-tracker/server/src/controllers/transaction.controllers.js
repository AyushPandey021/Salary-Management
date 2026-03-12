import Transaction from "../models/transaction.js";

export const addTransaction = async (req, res) => {

  try {

    const {
      type,
      title,
      amount,
      category,
      paymentMode,
      description,
      date
    } = req.body;

    if (!title || !amount) {
      return res.status(400).json({
        message: "Title and amount required"
      });
    }

    const transaction = await Transaction.create({

      userId: req.user.id,

      type,
      title,
      amount,
      category,
      paymentMode,
      description,
      date

    });

    res.status(201).json(transaction);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

export const getTransactions = async (req, res) => {

  try {

    const transactions = await Transaction.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};