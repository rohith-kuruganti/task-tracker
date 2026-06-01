const { createUser: createUserService } = require("../services/userService");

const { successResponse, errorResponse } = require("../utils/apiResponse");

const createUser = async (req, res) => {
  try {
    const user = await createUserService(req.body, req.user.organizationId);

    return successResponse(res, 201, "User created successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return errorResponse(
        res,
        400,
        "EMAIL_ALREADY_EXISTS",
        "Email already exists"
      );
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

module.exports = {
  createUser,
};
