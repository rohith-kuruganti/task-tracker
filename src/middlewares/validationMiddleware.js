const { errorResponse } = require("../utils/apiResponse");

const registerValidation = (req, res, next) => {
  const { name, email, password, organizationName } = req.body;

  if (!name || name.trim() === "") {
    return errorResponse(res, 400, "VALIDATION_ERROR", "Name is required");
  }

  if (!email || email.trim() === "") {
    return errorResponse(res, 400, "VALIDATION_ERROR", "Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return errorResponse(res, 400, "VALIDATION_ERROR", "Invalid email format");
  }

  if (!password) {
    return errorResponse(res, 400, "VALIDATION_ERROR", "Password is required");
  }

  if (password.length < 8) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "Password must be at least 8 characters"
    );
  }

  if (!organizationName || organizationName.trim() === "") {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "Organization name is required"
    );
  }

  next();
};

module.exports = registerValidation;
