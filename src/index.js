const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
const publicDir = path.join(__dirname, "../public")

const PORT = process.env.PORT || 3000
const WELCOME_MESSAGE = "Welcome, new User"

app.use(express.static(publicDir))

io.on("connection", (socket) => { //socket contem informação da conexão recém feita
    console.log("new connection")
    socket.emit("message", WELCOME_MESSAGE) //manda eventos para clientes. eventos: nome, valor que aparece para cliente
    socket.broadcast.emit("message", "new User joins")

    socket.on("sendMessageEvent", (message) => { 
        io.emit("sendMessageEvent", message) // manda para todas as conexões
    })

    socket.on("sendLocationEvent", (coords) => { 
        socket.broadcast.emit("message", "Lat:" + coords.lat + ", Long:" + coords.long)
        socket.broadcast.emit("message", "https://www.google.com/maps?q=" + coords.lat + "," + coords.long)
    })

    socket.on("disconnect", () => {
        io.emit("message", "user disconnect") // manda para todas as conexões
    })
})

server.listen(PORT, () => { //necessário para usar sockets
    console.log("starting server on port " + PORT)
})