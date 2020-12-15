const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((response) => {
    console.log("Connected to database!");
  })
  .catch((e) => {
    console.log("Connection failed!");
  });
