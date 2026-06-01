const validateTask = ({ title, priority, assignee, due_date }) => {
  if (!title || title.trim() === "") {
    throw new Error("TITLE_REQUIRED");
  }

  if (!assignee) {
    throw new Error("ASSIGNEE_REQUIRED");
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH"];

  if (priority && !validPriorities.includes(priority)) {
    throw new Error("INVALID_PRIORITY");
  }

  if (due_date) {
    const dueDate = new Date(due_date);

    if (dueDate <= new Date()) {
      throw new Error("INVALID_DUE_DATE");
    }
  }
};

module.exports = {
  validateTask,
};
