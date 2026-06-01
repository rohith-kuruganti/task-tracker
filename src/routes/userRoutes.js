const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const rbac = require("../middlewares/rbacMiddleware");

const { createUser } = require("../controllers/userController");

const router = express.Router();

router.post("/", authMiddleware, rbac(["ADMIN"]), createUser);

module.exports = router;
