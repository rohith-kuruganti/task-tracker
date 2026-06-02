require("dotenv").config();
require("./config/redis");
const express = require("express");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorResponse } = require("./utils/apiResponse");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  return errorResponse(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "Something went wrong"
  );
});

const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
