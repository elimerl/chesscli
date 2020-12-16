"use strict";

import { customAlphabet, nanoid } from "nanoid";
import * as socketio from "socket.io";
import { createServer } from "http";

import { Chess, ChessInstance } from "chess.js";
const games: Map<string, ChessInstance> = new Map();
const server = createServer((req, res) => {
  if (req.url === "/games") {
    res.writeHead(200);
    res.end(JSON.stringify(Array.from(games.keys())));
  }
});
const io: socketio.Server = require("socket.io")(server);
server.listen(3000);
console.log("server up on localhost:3000");
io.on("connection", (socket: socketio.Socket) => {
  let game = "";
  socket.on("host", () => {
    const id = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6)();
    game = id;
    games.set(id, new Chess());
    socket.join(id);
    socket.emit("joined", id, "wb".charAt(io.to(id).sockets.sockets.size - 1));
    //@ts-expect-error
    socket.turn = "w";
  });
  socket.on("join", id => {
    if (games.has(id)) {
      game = id;
      if (games.get(id)) {
        socket.join(id);
        socket.emit(
          "joined",
          id,
          "wb".charAt(io.to(id).sockets.sockets.size - 1)
        );
        console.log(io.to(id).sockets.sockets.size);
        //@ts-expect-error
        socket.turn = "b";
      }
      if (io.to(id).sockets.sockets.size >= 2) {
        io.to(id).emit("start", games.get(id).fen());
      }
    } else {
      socket.disconnect();
    }
  });
  socket.on("moved", fen => {
    const chess = new Chess(fen);
    console.log(chess.ascii());
    //@ts-expect-error
    if ((chess.turn() === socket.turn) === "w" ? "b" : "w") {
      if (chess.game_over()) {
        io.to(getGameID(socket)).emit("game-over", chess.fen());
      } else {
        games.get(getGameID(socket)).load(fen);
        io.to(getGameID(socket)).emit(
          "start",
          games.get(getGameID(socket)).fen()
        );
      }
    }
  });
});
const getGameID: (socket: socketio.Socket) => string | null = socket => {
  return Array.from(socket.rooms.values()).pop().length === 6
    ? Array.from(socket.rooms.values()).pop()
    : null;
};
