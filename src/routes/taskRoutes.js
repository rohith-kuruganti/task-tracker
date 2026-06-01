const express = require("express");
const {
  createTask,
  updateTaskStatus,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middlewares/authMiddleware");
const rbac = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.post("/", authMiddleware, rbac(["ADMIN", "MANAGER"]), createTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus);
router.get("/", authMiddleware, getTasks);
router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, rbac(["ADMIN", "MANAGER"]), updateTask);
router.delete("/:id", authMiddleware, rbac(["ADMIN", "MANAGER"]), deleteTask);

module.exports = router;
