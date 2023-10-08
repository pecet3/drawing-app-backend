const express = require('express');
const http = require('http');
const app = express();

const server = http.createServer(app)

import { Server } from "socket.io"

const io = new Server(server, {
    cors: {
        origin: "*"
    },

})
type DrawLine = {
    color: string
    size: number
    currentPoint: Point
    prevPoint: Point | null
}
type Point = {
    x: number;
    y: number;
}
let connections = 0
io.on("connection", (socket) => {
    console.log(`💚 Connection numer: ${connections}`)
    connections++
    socket.on("client-ready", () => {
        socket.broadcast.emit("get-canvas-state")
    })

    let canvasState: string;

    socket.on("canvas-state", (state) => {
        console.log("💛 canvas state server")
        canvasState = state
        console.log(canvasState.slice(0, 24))
        socket.broadcast.emit("canvas-state-from-server", canvasState)
    })
    socket.on("draw-line", ({ prevPoint, currentPoint, color, size }: DrawLine) => {
        socket.broadcast.emit("draw-line", { prevPoint, currentPoint, color, size })
    })
    socket.on("clear", () => io.emit("clear"))
})

server.listen(3001, () => {
    console.log("💚 Listening on port 3001 💚")
})