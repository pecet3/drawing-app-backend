"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var http = require('http');
var path = require('path');
var cors = require('cors');
var socket_io_1 = require("socket.io");
var app = express();
app.use(cors({
    origin: "*"
}));
var server = http.createServer(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    },
});
var connections = 0;
io.on("connection", function (socket) {
    console.log("\uD83D\uDC9A Connection number: ".concat(connections));
    connections++;
    socket.on("client-ready", function () {
        socket.broadcast.emit("get-canvas-state");
    });
    var canvasState;
    socket.on("canvas-state", function (state) {
        console.log("💛 canvas state server");
        canvasState = state;
        console.log(canvasState.slice(0, 24));
        socket.broadcast.emit("canvas-state-from-server", canvasState);
    });
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    socket.on("draw-line", function (_a) {
        var prevPoint = _a.prevPoint, currentPoint = _a.currentPoint, color = _a.color, size = _a.size;
        socket.broadcast.emit("draw-line", { prevPoint: prevPoint, currentPoint: currentPoint, color: color, size: size });
    });
    socket.on("clear", function () { return io.emit("clear"); });
});

const port = 3000
server.listen(port, function () {
    console.log(`💚 Listening on port ${port} 💚`);
    app.get('/', function (req, res) {
        console.log("User visited");
        res.json({ message: "hello world" });
    });
});
