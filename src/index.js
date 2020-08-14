const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")

const { generateMessage } = require("./utils/messages")

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
    socket.emit("message", generateMessage(WELCOME_MESSAGE)) //manda eventos para clientes. eventos: nome, valor que aparece para cliente
    socket.broadcast.emit("message", generateMessage("new User joins"))

    socket.on("message", (message, callback) => { //callback é para ack
        const badwords = new Filter()
        if(badwords.isProfane(message)) {
            return callback("Don't use curse words or profanity")
        }
        io.emit("message", generateMessage(message)) // manda para todas as conexões
        callback()
    })

    socket.on("sendLocationEvent", (coords, callback) => {
        const location = "https://www.google.com/maps?q=" + coords.lat + "," + coords.long
        io.emit("sendLocationMessageEvent", generateMessage(location))
        callback()
    })

    socket.on("disconnect", () => {
        io.emit("message", generateMessage("user disconnect")) // manda para todas as conexões
    })
})

server.listen(PORT, () => { //necessário para usar sockets
    console.log("starting server on port " + PORT)
})