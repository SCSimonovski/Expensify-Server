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
    return next(
      new HttpError("Creating expense failed, please try again.", 500)
    );
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
      return next(
        new HttpError("Could not find expense for the provided id.", 404)
      );
    }

    res.send(expense);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find an expense.", 500)
    );
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
      return next(new HttpError("Could not find expenses for that user.", 404));
    }

    res.send(expenses);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find expenses.", 500)
    );
  }
};

/////////////////////////////////////////////////////
// Update item /////////////////////////////////////

const updateExpense = async (req, res, next) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "amount", "note", "date"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  try {
    const expense = await Expense.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!expense) {
      return next(
        new HttpError("Could not find expense for the provided id.", 404)
      );
    }

    res.send(expense);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update the expense.", 500)
    );
  }
};

////////////////////////////////////////////////////////
// Delete expense /////////////////////////////////////////

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return next(
        new HttpError("Could not find expense for the provided id.", 404)
      );
    }

    res.send(expense);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete the item.", 500)
    );
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
