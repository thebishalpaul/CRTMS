const express = require("express");
const colors = require("colors");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "3000mb" }));
app.use(express.urlencoded({ limit: "3000mb", extended: true }));
app.use(express.static(path.join(__dirname, "./client/build")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);

// Initialize Socket.IO
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Allow requests from all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all types of requests
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow credentials (e.g., cookies)
  },
});

// configure dotenv
dotenv.config();
const PORT = process.env.PORT || 3000;

// database configuration
connectDB(io);

// routes
const instituteRoutes = require("./routes/instituteRoutes");
app.use("/api/v1/institute", instituteRoutes);

const basicRoutes = require("./routes/basicRoutes");
app.use("/api/v1/basic", basicRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/v1/auth", authRoutes);

const divisionRoutes = require("./routes/divisionRoutes");
app.use("/api/v1/division", divisionRoutes);

const departmentRoutes = require("./routes/departmentRoutes");
app.use("/api/v1/department", departmentRoutes);

const projectRoutes = require("./routes/projectRoutes");
app.use("/api/v1/project", projectRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/v1/user", userRoutes);

const levelRoutes = require("./routes/levelRoutes");
app.use("/api/v1/level", levelRoutes);

const requestRoutes = require("./routes/requestRoutes");
app.use("/api/v1/request", requestRoutes);

const historyRoutes = require("./routes/historyRoutes");
app.use("/api/v1/history", historyRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/v1/notification", notificationRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/v1/task", taskRoutes);

const countRoutes = require("./routes/countRoutes");
app.use("/api/v1/count", countRoutes);

// rest api
app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// socket.io connection handling
io.on("connect", (socket) => {
  console.log("A client connected");
  // in future to handle events from client here
  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

String.prototype.capitalize = function () {
  return this?.trim()
    ?.split(" ")
    ?.map((word) => {
      return word?.charAt(0)?.toUpperCase() + word?.slice(1);
    })
    ?.join(" ");
};

// listen
server.listen(PORT, () => {
  console.log(`Server running on port:  ${PORT}`.bgGreen.white);
});
