// Helper: send error via next()
 const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

export default catchAsync