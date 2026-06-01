const bcrypt = require("bcryptjs");

const User = require("../models/User");

const createUser = async ({ name, email, password, role }, organizationId) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    organizationId,
  });

  return user;
};

module.exports = {
  createUser,
};
