const generateMessage = (username, text) => {
    console.log("messages:" + username)
    console.log("messages:" + text)
    return {
        username: username,
        text:text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}