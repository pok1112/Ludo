const socket = io();
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const playersDiv = document.getElementById("players");
let roomID = "";

function joinRoom() {
  roomID = document.getElementById("roomInput").value;
  if (!roomID) return alert("Masukkan ID Room dulu!");
  socket.emit("joinRoom", roomID);
}

socket.on("roomFull", () => {
  alert("Room sudah penuh! Maksimal 4 pemain.");
});

socket.on("updatePlayers", (players) => {
  playersDiv.innerHTML = "<h3>Pemain:</h3>" + players.map(p => `<p>${p}</p>`).join("");
});

canvas.addEventListener("click", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  drawCircle(x, y, "blue"); // Warna lokal
  socket.emit("move", { x, y });
});

socket.on("move", ({ x, y }) => {
  drawCircle(x, y, "red"); // Warna dari pemain lain
});

function drawCircle(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
}
