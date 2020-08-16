const users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    console.log("0")
    if(!username || !room) {
        console.log("1")
        return {
            error:"usuário e sala são obrigatórios"
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        console.log("2")
        return {
            error: "usuário já existe na sala"
        }
    }

    const user = { id, username, room}
    users.push(user)
    console.log(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => {return user.id === id})
}

const getUsersInRoom = (room) => {
    let usersInRoom = []
    users.forEach(user => {
        if(user.room === room.trim().toLowerCase()) {
            usersInRoom.push(user)
        }
    })
    return usersInRoom
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}