#!/usr/bin/env node
"use strict";
import { Chess } from "chess.js";
import { createInterface } from "readline";
import fetch from "node-fetch";
const socket: Socket = require("socket.io-client")("http://localhost:3000");
import { prompt } from "inquirer";
import { Socket } from "socket.io-client";
if (process.argv[2]) {
  socket.emit("join", process.argv[2].toUpperCase());
} else {
  fetch("http://localhost:3000/games")
    .then(res => res.json())
    .then(games => {
      prompt([
        {
          type: "list",
          name: "game",
          message: "Pick a game to join, or create one",
          choices: ["Create Game", ...games]
        }
      ]).then(({ game }) => {
        if (game === "Create Game") {
          socket.emit("host");
        } else {
          socket.emit("join", game);
        }
      });
    });
}
let side;
socket.on("joined", (id, s) => {
  console.log("connected to game " + id);
  side = s;
});
socket.on("start", fen => {
  const chess = new Chess(fen);
  process.stdout.write("\x1b\x5b\x33\x4a\x1b\x5b\x32\x4a\x1b\x5b\x31\x4a");
  console.clear();
  console.log("\n", chess.ascii(), chess.turn() + " turn - you are " + side);
  if (chess.turn() === side) {
    askMove(chess);
  }
});
socket.on("game-over", fen => {
  const chess = new Chess(fen);
  if (chess.in_checkmate()) {
    console.log(chess.turn() + " has won");
    socket.disconnect();
  }
});
function askMove(chess) {
  const p = prompt([
    { type: "input", name: "from", message: "Move piece at:" },
    {
      type: "input",
      name: "to",
      message: "to:",
      validate: move => move.charAt(0).match(/[a-h]/) && !isNaN(move.charAt(1))
    }
  ]).then(({ from, to }) => {
    const res = chess.move({ from, to });
    if (res === null) {
      console.log("invalid move");
      askMove(chess);
    } else {
      socket.emit("moved", chess.fen());
    }
  });
}
