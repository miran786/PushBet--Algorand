const express = require("express");
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load env from server directory if not found in root
dotenv.config({ path: path.resolve(__dirname, '.env') });

const mongoose = require("./database");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

const http = require("http");

// Load SSL credentials or fallback to HTTP
let server;
// Local Development: Force HTTP to work with Vite Proxy
// The proxy handles HTTPS for the client, so backend can be HTTP
console.log("Local development/Production: Starting HTTP server.");
server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin for hackathon demo
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: true, // Reflects the request origin
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Middleware to use io in controllers
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
  req.io = io;
  next();
});

app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/gamification", gamificationRoutes); // Added gamification routes
app.use("/api/civic", require("./routes/civicRoutes"));
app.use("/api/asset", require("./routes/assetRoutes"));
app.use("/api", require("./routes/commuteRoutes"));

// Now pass io to the admin routes after io is initialized
const adminRoutes = require("./controllers/consoleControllers")(io);
app.use("/admin", adminRoutes); // Mount the routes

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// DEBUG: 404 Handler
app.use((req, res, next) => {
  console.log(`[ERROR] 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found", path: req.url });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
