#!/usr/bin/env node
"use strict";
import { Chess, ChessInstance } from "chess.js";
import { createInterface } from "readline";
import fetch from "node-fetch";
const socket: Socket = require("socket.io-client")("http://localhost:3000");
import { prompt } from "inquirer";
import { Socket } from "socket.io-client";
import { parse } from "yaml";
import { readFileSync } from "fs";
import { resolve } from "path";
const config = parse(
  readFileSync(resolve(__dirname, "../client.yml"), "utf-8")
);

if (process.argv[2]) {
  socket.emit("join", process.argv[2].toUpperCase());
} else {
  fetch(config.host + "/games")
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
let side, game;
socket.on("joined", (id, s) => {
  console.log("connected to game " + id);
  side = s;
  game = id;
});
socket.on("start", fen => {
  const chess = new Chess(fen);
  process.stdout.write("\x1b\x5b\x33\x4a\x1b\x5b\x32\x4a\x1b\x5b\x31\x4a");
  console.clear();
  showChess(chess);
  console.log(chess.turn() + " turn - you are " + side);
  if (chess.turn() === side) {
    askMove(chess);
  }
});
socket.on("game-over", fen => {
  const chess = new Chess(fen);
  if (chess.in_checkmate()) {
    console.log((chess.turn() === "w" ? "b" : "w") + " has won");
    socket.disconnect();
  }
});
socket.on("disconnect", () => {
  console.log("disconnected from server");
  process.exit();
});
socket.on("left", reason => {
  console.log(reason);
  process.exit(0);
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
function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}
function showChess(chess: ChessInstance) {
  const rowNames = "abcdefgh";
  const s = "-----------------------------------------";
  let seperator = s;
  s.split("").forEach((elem, i) => {
    if (i % 5 === 0) {
      seperator = setCharAt(seperator, i + 2, rowNames.charAt(i / 5));
    }
  });
  let rows = 8;
  chess.board().forEach((row, i) => {
    let rowStr = ``;
    console.log("  " + "-".repeat(41));

    row.forEach((piece, j) => {
      rowStr += "  | ";
      if (piece === null) {
        rowStr += " ";
        return;
      }
      if (piece.color === "b") {
        switch (piece.type) {
          case "k":
            rowStr += "♚";
            break;
          case "b":
            rowStr += "♝";
            break;
          case "n":
            rowStr += "♞";
            break;
          case "p":
            rowStr += "♟";
            break;
          case "q":
            rowStr += "♛";
            break;
          case "r":
            rowStr += "♜";
            break;
        }
      } else {
        switch (piece.type) {
          case "k":
            rowStr += "♔";
            break;
          case "b":
            rowStr += "♗";
            break;
          case "n":
            rowStr += "♘";
            break;
          case "p":
            rowStr += "♙";
            break;
          case "q":
            rowStr += "♕";
            break;
          case "r":
            rowStr += "♖";
            break;
        }
      }
    });
    rows--;
    console.log(rowStr + "  | " + (1 + rows));
  });
  console.log("  " + seperator);
}
