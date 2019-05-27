const error = async (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: true,
      message: 'Unauthorized',
    });
  } else {
    next(err);
  }
  return 0;
};

module.exports = error;
