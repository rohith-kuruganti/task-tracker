const { errorResponse } = require("../utils/apiResponse");

const rbac = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return errorResponse(
        res,
        401,
        "UNAUTHORIZED",
        "User not found in request"
      );
    }

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        403,
        "FORBIDDEN",
        "You do not have permission to perform this action"
      );
    }

    next();
  };
};

module.exports = rbac;
