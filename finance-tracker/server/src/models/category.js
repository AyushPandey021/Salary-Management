import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  emoji: {
    type: String,
    default: "📁"
  },

  type: {
    type: String,
    enum: ["Income","Expense","Investment"],
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
},
{ timestamps: true }
);

export default mongoose.model("Category", CategorySchema);