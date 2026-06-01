const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Organization = require("../models/Organization");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const RefreshToken = require("../models/RefreshToken");

const registerUser = async ({ name, email, password, organizationName }) => {
  //Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  //Create organization
  const existingOrganization = await Organization.findOne({
    name: organizationName,
  });

  if (existingOrganization) {
    throw new Error("ORGANIZATION_ALREADY_EXISTS");
  }
  const organization = await Organization.create({
    name: organizationName,
  });

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //Create admin user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "ADMIN",
    organizationId: organization._id,
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  //Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  //Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = uuidv4();
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const refreshAccessToken = async (refreshToken) => {
  const existingToken = await RefreshToken.findOne({
    token: refreshToken,
  });

  if (!existingToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const user = await User.findById(existingToken.userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // Create new access token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId,
    },
    process.env.JWT_SECRET || "secretkey",
    {
      expiresIn: "15m",
    }
  );

  const newRefreshToken = uuidv4();

  await RefreshToken.deleteOne({
    _id: existingToken._id,
  });

  await RefreshToken.create({
    userId: user._id,
    token: newRefreshToken,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
};
