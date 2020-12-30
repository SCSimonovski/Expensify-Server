const mongoose = require("mongoose");
const validator = require("validator");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },

    note: {
      type: String,
      trim: true,
    },

    date: {
      type: Number,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.methods.toJSON = function () {
  const expense = this;
  const expenseObject = expense.toObject();

  expenseObject.id = expenseObject._id;
  delete expenseObject._id;

  return expenseObject;
};

const Expense = new mongoose.model("Expense", expenseSchema);

module.exports = Expense;
