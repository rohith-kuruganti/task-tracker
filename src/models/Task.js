const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"],
      default: "TODO",
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    due_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ organizationId: 1, status: 1 });
taskSchema.index({ organizationId: 1, assignee: 1 });
taskSchema.index({ organizationId: 1, due_date: 1 });

module.exports = mongoose.model("Task", taskSchema);
