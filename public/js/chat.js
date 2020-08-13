const socket = io()
const form = document.querySelector("form")

socket.on("message", (message) => {
    console.log(message)
})

socket.on("sendMessageEvent", (message) => {
    console.log(message)
})

form.addEventListener("submit", (event) => {
    event.preventDefault()
    const message = event.target.elements.messageInput.value
    console.log("sending message '" + message + "'")
    socket.emit("sendMessageEvent", message)
})

document.querySelector("#sendLocation").addEventListener("click", () => {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position.coords)
            console.log(position.coords.latitude)
            console.log(position.coords.longitude)
            socket.emit("sendLocationEvent", {
                lat: position.coords.latitude,
                long: position.coords.longitude
            })
        }) //assincrono, mas não suporta promises ou async
    } else {
        alert("not supported in your browser/OS")
    }
})