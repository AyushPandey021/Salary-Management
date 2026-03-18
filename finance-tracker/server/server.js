import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import transactionRoutes from "./src/routes/transaction.route.js";
import categoryRoutes from "./src/routes/category.routes.js"
dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("API is running successfully 🚀");
});
app.use("/api/auth", authRoutes);
app.use("/api", transactionRoutes);
app.use("/api/categories", categoryRoutes)
const PORT = process.env.PORT || 5000;

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});