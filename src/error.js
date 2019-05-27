const error = async (status, message, res) => {
  res.status(status).json({
    error: true,
    message,
  });
  return 0;
};

module.exports = error;
