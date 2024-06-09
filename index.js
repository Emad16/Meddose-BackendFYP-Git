const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();

app.use(cors());
const server = require("http").createServer(app);

const io = new Server(server, { cors: "http://192.168.0.115:8081" });

// ------------ Passport Configuration ------------//
require("./src/config/passport")(passport);

//------------ DB Configuration ------------//
const db = process.env.MONGOURI;

//------------ Mongo Connection ------------//
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.log(err));

// Socket.IO logic here
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log(`${socket.id} :  user connected`);

  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId == userId) &&
      onlineUsers.push({ userId, socketId: socket.id });
    console.log("onlineUsers", onlineUsers);
  });

  io.emit("getOnlineUsers", onlineUsers);
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find((user) => user.userId === message.recieverID);

    console.log(message, "RECIEVED FROM SOCKET");
    if (user) {
      console.log(user, "USER");
      io.to(user.socketId).emit("getMessage", message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== socket.id);
    console.log("user disconnected", onlineUsers);

    io.emit("getOnlineUsers", onlineUsers);
  });
});

//------------ EJS Configuration ------------//
app.use(expressLayouts);
app.use("/assets", express.static("./assets"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//------------ Bodyparser Configuration ------------//
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(bodyParser.json());

//------------ Express session Configuration ------------//
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//------------ Passport Middlewares ------------//
app.use(passport.initialize());
app.use(passport.session());

//------------ Connecting flash ------------//
app.use(flash());

//------------ Global variables ------------//
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//------------ Routes ------------//
app.use("/api/", require("./src/routes/index"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/chat", require("./src/routes/chat"));
app.use("/api/message", require("./src/routes/message"));
app.use("/api/request", require("./src/routes/request"));
app.use("/api/medication", require("./src/routes/medication"));
app.use("/api/schedule", require("./src/routes/schedule"));
app.use("/api/mood", require("./src/routes/mood"));

const PORT = process.env.PORT || 3001;

server.listen(PORT, console.log(`Server running on PORT ${PORT}`));
