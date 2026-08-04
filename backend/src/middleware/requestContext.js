export const requestContext = (req, res, next) => {
  res.setHeader('x-request-id', req.id);
  next();
};