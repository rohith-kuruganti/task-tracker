const allowedTransitions = {
  TODO: ["IN_PROGRESS", "BLOCKED"],
  IN_PROGRESS: ["IN_REVIEW", "BLOCKED"],
  IN_REVIEW: ["DONE", "BLOCKED"],
  DONE: [],
  BLOCKED: ["TODO"],
};

const isValidTransition = (currentStatus, newStatus) => {
  if (!allowedTransitions[currentStatus]) return false;

  return allowedTransitions[currentStatus].includes(newStatus);
};

module.exports = {
  isValidTransition,
};
