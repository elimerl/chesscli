"use strict";

const { Server } = require("socket.io");

/**
 * @type {Server}
 */
const io = require("socket.io")(80);
const games = new Map();
