const errorHandler = (error, req, res, next) => {
  const code = error.code && error.code < 599 ? error.code : 500;
  return res.status(code).send({
    error: error.message || "An unknown error has occured",
    code,
  });
};

module.exports = errorHandler;
