const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors')
import { Server } from 'socket.io';

const app = express();

app.use(cors({
    cors: {
        origin: "*"
    },
}))

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    },
});

type DrawLine = {
    color: string;
    size: number;
    currentPoint: Point;
    prevPoint: Point | null;
};

type Point = {
    x: number;
    y: number;
};

let connections = 0;

io.on("connection", (socket) => {
    console.log(`💚 Connection number: ${connections}`);
    connections++;

    socket.on("client-ready", () => {
        socket.broadcast.emit("get-canvas-state");
    });

    let canvasState: string;

    socket.on("canvas-state", (state) => {
        console.log("💛 canvas state server");
        canvasState = state;
        console.log(canvasState.slice(0, 24));
        socket.broadcast.emit("canvas-state-from-server", canvasState);
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    socket.on("draw-line", ({ prevPoint, currentPoint, color, size }: DrawLine) => {
        socket.broadcast.emit("draw-line", { prevPoint, currentPoint, color, size });
    });

    socket.on("clear", () => io.emit("clear"));
});
const port = 808
server.listen(port, () => {
    console.log(`💚 Listening on port ${port} 💚 / cors`);
    app.get('/', function (req, res) {
        console.log("User visited")
        res.json({ message: "hello world" });
    });
});
