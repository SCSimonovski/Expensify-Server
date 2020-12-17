require("./db/mongoose.js");
const express = require("express");
const cors = require("cors");

const userRouter = require("./routers/users-router");
const expensesRouter = require("./routers/expenses-router");
const errorHandler = require("./error/error-handler");

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(cors());

app.use(userRouter);
app.use(expensesRouter);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).send({
    error: "The path doesn't exist",
  });
});

app.listen(port, () => {
  console.log("Server is up on port: ", port);
});
