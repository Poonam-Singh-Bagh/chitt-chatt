// import { createServer } from "http";
// import { Server } from "socket.io";
// import { v4 as uuidv4 } from "uuid";

const createServer = require("http").createServer;
const Server = require("socket.io").Server;
uuidv4 = require("uuid").v4;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("Invalid username"));
  }
  socket.username = username;
  socket.userId = uuidv4();
  next();
});

io.on("connection", (socket) => {
  console.log("a user connected");
  //All connected users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userId: socket.userId,
      username: socket.username,
    });
  }

  //All connected users event
  io.emit("users", users);

  //User connected event (boardcast to all users except the sender)
  socket.broadcast.emit("user connected", {
    userId: socket.userId,
    username: socket.username,
  });

  socket.on("new message", (message) => {
    socket.broadcast.emit("new message", {
      userId: socket.userId,
      username: socket.username,
      message,
    })
  })

  // Connected user details event
  socket.emit("session", { userId: socket.userId, username: socket.username });
});

httpServer.listen(process.env.PORT || 3001);
