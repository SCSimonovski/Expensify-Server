const Expense = require("../models/expenses-model.js");
const HttpError = require("../error/http-error");

////////////////////////////////////////////////////
// Create new expense /////////////////////////////////

const createExpense = async (req, res, next) => {
  const expense = new Expense(req.body);
  try {
    await expense.save();
    res.status(201).send(expense);
  } catch (err) {
    next(err);
  }
};

//////////////////////////////////////////////////
// Get expense by ID ////////////////////////////////

const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
    });

    if (!expense) {
      throw new HttpError("The expense was not found", 404);
    }

    res.send(expense);
  } catch (err) {
    next(err);
  }
};

//////////////////////////////////////////////////
// Get all expenses ////////////////////////////////

const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      owner: req.user._id,
    });

    if (!expenses) {
      throw new HttpError("There's no expenses for that user", 404);
    }

    res.send(expenses);
  } catch (err) {
    next(err);
  }
};

/////////////////////////////////////////////////////
// Update item /////////////////////////////////////

const updateExpense = async (req, res, next) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "amount", "note"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    throw new HttpError("Invalid updates", 400);
  }

  try {
    const expense = await Expense.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!expense) {
      throw new HttpError("The expense was not found", 404);
    }

    res.send(expense);
  } catch (err) {
    next(err);
  }
};

////////////////////////////////////////////////////////
// Delete expense /////////////////////////////////////////

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      throw new HttpError("The expense was not found", 404);
    }

    res.send(expense);
  } catch (err) {
    next(err);
  }
};

////////////////////////////////////////////////////////

module.exports = {
  createExpense,
  getExpenseById,
  getAllExpenses,
  updateExpense,
  deleteExpense,
};
