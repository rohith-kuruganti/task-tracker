const express = require("express");
const {
  register,
  login,
  refreshToken,
} = require("../controllers/authController");
const validationMiddleware = require("../middlewares/validationMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const rbac = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.post("/register", validationMiddleware, register);
router.post("/login", login);
router.get("/admin-only", authMiddleware, rbac(["ADMIN"]), (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user,
  });
});
router.post("/refresh", refreshToken);

module.exports = router;
