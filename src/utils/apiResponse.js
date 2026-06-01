const successResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  statusCode = 500,
  code = "INTERNAL_SERVER_ERROR",
  message = "Something went wrong"
) => {
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    code,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
