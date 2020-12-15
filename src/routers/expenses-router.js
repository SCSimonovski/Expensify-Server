const express = require("express");
const auth = require("../middleware/auth");

const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenses-controller");

const router = new express.Router();

router.use(auth);

// POST METHODS
router.post("/expenses", createExpense);

// // GET METHODS
router.get("/expenses", getAllExpenses);
router.get("/expenses/:id", getExpenseById);

// // PATCH METHODS
router.patch("/expenses/:id", updateExpense);

// // DELETE METHODS
router.delete("/expenses/:id", deleteExpense);

module.exports = router;
