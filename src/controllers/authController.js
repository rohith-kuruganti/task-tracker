const { registerUser, loginUser } = require("../services/authService");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { refreshAccessToken } = require("../services/authService");

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    return successResponse(res, 201, "User registered successfully", {
      userId: user._id,
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

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    return successResponse(res, 200, "Login successful", result);
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return errorResponse(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password"
      );
    }
    if (error.message === "ORGANIZATION_ALREADY_EXISTS") {
      return errorResponse(
        res,
        400,
        "ORGANIZATION_ALREADY_EXISTS",
        "Organization already exists"
      );
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await refreshAccessToken(refreshToken);

    return successResponse(res, 200, "Token refreshed successfully", tokens);
  } catch (error) {
    if (error.message === "INVALID_REFRESH_TOKEN") {
      return errorResponse(
        res,
        401,
        "INVALID_REFRESH_TOKEN",
        "Invalid refresh token"
      );
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
};
