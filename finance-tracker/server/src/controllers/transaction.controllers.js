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



// export const getSummary = async (req, res) => {
//   try {

//     const transactions = await Transaction.find({
//       userId: req.user.id
//     });

//     let income = 0;
//     let expense = 0;
//     let investment = 0;

//     transactions.forEach(t => {

//       const amount = Number(t.amount);

//       if (t.type === "Income") {
//         income += amount;
//       }

//       if (t.type === "Expense") {
//         expense += amount;
//       }

//       if (t.type === "Investment") {
//         investment += amount;
//       }

//     });

//     const balance = income - expense - investment;

//     res.json({
//       income,
//       expense,
//       investment,
//       balance
//     });

//   } catch (error) {

//     res.status(500).json({
//       message: error.message
//     });

//   }
// };
export const getSummary = async (req, res) => {
  try {

    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      createdAt: { $gte: startDate, $lt: endDate }
    });

    let income = 0;
    let expense = 0;
    let investment = 0;

    transactions.forEach(t => {

      const amount = Number(t.amount);

      if (t.type === "Income") income += amount;
      if (t.type === "Expense") expense += amount;
      if (t.type === "Investment") investment += amount;

    });

    const balance = income - expense - investment;

    res.json({
      income,
      expense,
      investment,
      balance
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// export const getRecentTransactions = async (req, res) => {
//   try {

//     const transactions = await Transaction.find({
//       userId: req.user.id
//     })
//     .sort({ createdAt: -1 })
//     .limit(5);

//     res.json(transactions);

//   } catch (error) {

//     res.status(500).json({
//       message: error.message
//     });

//   }
// };
export const getRecentTransactions = async (req, res) => {
  try {

    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      createdAt: { $gte: startDate, $lt: endDate }
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json(transactions);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};
export const getTransactionsByMonth = async (req, res) => {
  try {

    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        message: "Month required"
      });
    }

    const [monthName, year] = month.split(" ");

    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

    const startDate = new Date(year, monthIndex, 1, 0, 0, 0);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user.id,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


export const updateTransaction = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      type,
      title,
      amount,
      category,
      paymentMode,
      description,
      date
    } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id
      },
      {
        type,
        title,
        amount,
        category,
        paymentMode,
        description,
        date
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json(transaction);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

export const deleteTransaction = async (req, res) => {

  try {

    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json({ message: "Transaction deleted" });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};