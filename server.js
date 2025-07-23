const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

let rooms = {}; // { roomID: [socketId1, socketId2, ...] }

app.use(express.static(path.join(__dirname, "frontend")));

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);
  let currentRoom = null;

  socket.on("joinRoom", (roomID) => {
    if (!rooms[roomID]) rooms[roomID] = [];
    if (rooms[roomID].length >= 4) {
      socket.emit("roomFull");
      return;
    }

    rooms[roomID].push(socket.id);
    socket.join(roomID);
    currentRoom = roomID;

    io.to(roomID).emit("updatePlayers", rooms[roomID]);
  });

  socket.on("move", (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit("move", data);
    }
  });

  socket.on("disconnect", () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter(id => id !== socket.id);
      io.to(currentRoom).emit("updatePlayers", rooms[currentRoom]);

      if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom]; // Hapus room kalau kosong
      }
    }

    console.log("User disconnected: " + socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
