const Task = require("../models/Task");
const { isValidTransition } = require("../utils/taskTransitions");
const { validateTask } = require("../utils/taskValidator");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const User = require("../models/User");
const redisClient = require("../config/redis");
const { clearTaskCache } = require("../utils/cache");

const createTask = async (req, res) => {
  console.log("ROLE:", req.user.role);
  try {
    const { title, description, priority, assignee, due_date } = req.body;

    validateTask({
      title,
      priority,
      assignee,
      due_date,
    });
    const assigneeUser = await User.findById(assignee);

    if (!assigneeUser) {
      throw new Error("ASSIGNEE_NOT_FOUND");
    }
    if (
      assigneeUser.organizationId.toString() !==
      req.user.organizationId.toString()
    ) {
      throw new Error("INVALID_ASSIGNEE");
    }

    const task = await Task.create({
      title,
      description,
      priority,
      assignee,
      due_date,
      organizationId: req.user.organizationId,
    });
    await clearTaskCache(req.user.organizationId);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    if (error.message === "TITLE_REQUIRED") {
      return errorResponse(res, 400, "VALIDATION_ERROR", "Title is required");
    }

    if (error.message === "ASSIGNEE_REQUIRED") {
      return errorResponse(
        res,
        400,
        "VALIDATION_ERROR",
        "Assignee is required"
      );
    }

    if (error.message === "INVALID_PRIORITY") {
      return errorResponse(
        res,
        400,
        "VALIDATION_ERROR",
        "Priority must be LOW, MEDIUM or HIGH"
      );
    }

    if (error.message === "INVALID_DUE_DATE") {
      return errorResponse(
        res,
        400,
        "VALIDATION_ERROR",
        "due_date must be a future date"
      );
    }
    if (error.message === "ASSIGNEE_NOT_FOUND") {
      return errorResponse(
        res,
        404,
        "ASSIGNEE_NOT_FOUND",
        "Assignee not found"
      );
    }

    if (error.message === "INVALID_ASSIGNEE") {
      return errorResponse(
        res,
        400,
        "INVALID_ASSIGNEE",
        "Assignee must belong to your organization"
      );
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return errorResponse(res, 404, "TASK_NOT_FOUND", "Task not found");
    }

    //RBAC check (ASSIGNEE or MANAGER)
    const isAssignee = task.assignee.toString() === req.user.userId;

    const isManager = req.user.role === "MANAGER";

    if (!isAssignee && !isManager) {
      return errorResponse(
        res,
        403,
        "FORBIDDEN",
        "Not allowed to update this task"
      );
    }

    // Validate transition
    if (!isValidTransition(task.status, status)) {
      return errorResponse(
        res,
        400,
        "INVALID_STATUS_TRANSITION",
        `Cannot move from ${task.status} to ${status}`
      );
    }

    //Update status
    task.status = status;
    await task.save();
    await clearTaskCache(req.user.organizationId);

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, assignee } = req.query;

    const query = {
      organizationId: req.user.organizationId,
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (req.user.role === "MEMBER") {
      query.assignee = req.user.userId;
    } else if (assignee) {
      query.assignee = assignee;
    }

    const cacheKey = `tasks:${req.user.organizationId}:${page}:${limit}:${
      status || "all"
    }:${priority || "all"}:${query.assignee || "all"}`;

    const cachedTasks = await redisClient.get(cacheKey);

    if (cachedTasks) {
      return successResponse(
        res,
        200,
        "Tasks fetched from cache",
        JSON.parse(cachedTasks)
      );
    }

    const tasks = await Task.find(query)
      .populate("assignee", "name email role")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);

    const responseData = {
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));

    return successResponse(
      res,
      200,
      "Tasks fetched successfully",
      responseData
    );
  } catch (error) {
    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId).populate(
      "assignee",
      "name email role"
    );

    if (!task) {
      return errorResponse(res, 404, "TASK_NOT_FOUND", "Task not found");
    }

    // Organization isolation
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return errorResponse(res, 403, "FORBIDDEN", "Access denied");
    }

    // MEMBER restriction
    if (
      req.user.role === "MEMBER" &&
      task.assignee._id.toString() !== req.user.userId
    ) {
      return errorResponse(res, 403, "FORBIDDEN", "Access denied");
    }

    return successResponse(res, 200, "Task fetched successfully", task);
  } catch (error) {
    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return errorResponse(res, 404, "TASK_NOT_FOUND", "Task not found");
    }

    // Organization isolation
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return errorResponse(res, 403, "FORBIDDEN", "Access denied");
    }

    // Only ADMIN and MANAGER
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        "FORBIDDEN",
        "Only Admin or Manager can update tasks"
      );
    }

    const { title, description, priority, assignee, due_date } = req.body;

    if (title !== undefined) task.title = title;

    if (description !== undefined) task.description = description;

    if (priority !== undefined) task.priority = priority;

    if (assignee !== undefined) task.assignee = assignee;

    if (due_date !== undefined) task.due_date = due_date;

    await task.save();
    await clearTaskCache(req.user.organizationId);

    return successResponse(res, 200, "Task updated successfully", task);
  } catch (error) {
    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return errorResponse(res, 404, "TASK_NOT_FOUND", "Task not found");
    }

    // Organization isolation
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return errorResponse(res, 403, "FORBIDDEN", "Access denied");
    }

    // RBAC
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        "FORBIDDEN",
        "Only Admin or Manager can delete tasks"
      );
    }

    await Task.findByIdAndDelete(taskId);
    await clearTaskCache(req.user.organizationId);

    return successResponse(res, 200, "Task deleted successfully", null);
  } catch (error) {
    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR", error.message);
  }
};

module.exports = {
  createTask,
  updateTaskStatus,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
