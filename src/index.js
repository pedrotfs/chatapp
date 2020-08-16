const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")

const { generateMessage } = require("./utils/messages")
const { addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
const publicDir = path.join(__dirname, "../public")

const PORT = process.env.PORT || 3000
const WELCOME_MESSAGE = "Bem vindo, "

app.use(express.static(publicDir))

io.on("connection", (socket) => { //socket contem informação da conexão recém feita
    console.log("new connection")
    
    socket.on("join", ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})
        if(error) {
            console.log(error)
            return callback(error)
        }
        socket.join(user.room) //só é usavel no back end, permite emitir eventos a apenas essa 'sala'
        socket.emit("message", generateMessage("Chat Amizade", WELCOME_MESSAGE + user.username)) //manda eventos para clientes. eventos: nome, valor que aparece para cliente
        socket.broadcast.to(user.room).emit("message", generateMessage(user.username, user.username + " entrou na sala.")) // to é apenas para a sala em questão
        callback()
    }) 

    socket.on("message", (message, callback) => { //callback é para ack
        const user = getUser(socket.id)
        const badwords = new Filter()
        if(badwords.isProfane(message)) {
            return callback("Linguajar!")
        }
        io.to(user.room).emit("message", generateMessage(user.username, message)) // manda para todas as conexões
        callback()
    })

    socket.on("sendLocationEvent", (coords, callback) => {
        const user = getUser(socket.id)
        const location = "https://www.google.com/maps?q=" + coords.lat + "," + coords.long
        io.to(user.room).emit("sendLocationMessageEvent", generateMessage(user.username, location))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit("message", generateMessage("Chat Amizade",user.username+ " desconectou.")) // manda para todas as conexões
        }
    })
})

server.listen(PORT, () => { //necessário para usar sockets
    console.log("starting server on port " + PORT)
})