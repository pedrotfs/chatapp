const socket = io()

const $form = document.querySelector("form")
const $input = $form.querySelector("#messageInput")
const $button = $form.querySelector("#sendMessage")
const $sendLocationButton = document.querySelector("#sendLocation")
const $messages = document.querySelector("#messages")

const messageTemplate = document.querySelector("#messageTemplate").innerHTML
const messageLocationTemplate = document.querySelector("#messageLocationTemplate").innerHTML

socket.on("message", (message) => {
    console.log(message)
    $messages.insertAdjacentHTML("beforeend", Mustache.render(messageTemplate, {
        message:message.text,
        createdAt: moment(message.createdAt).format("hh:mm:ss")
    }))
})

socket.on("sendLocationMessageEvent", (message) => {
    console.log(message)
    $messages.insertAdjacentHTML("beforeend", Mustache.render(messageLocationTemplate, {
        message:message.text,
        createdAt: moment(message.createdAt).format("hh:mm:ss")
    }))
})

$form.addEventListener("submit", (event) => {
    event.preventDefault()
    $button.setAttribute("disabled", "disabled")

    const message = event.target.elements.messageInput.value
    console.log("sending message '" + message + "'")
    socket.emit("message", message, (error) => {  //ack
        $button.removeAttribute("disabled")
        $input.value = ""
        $input.focus()
        if(error) {
            return console.log(error)
        } else {
            console.log("message delivery confirmation")
        }
    })
})

document.querySelector("#sendLocation").addEventListener("click", () => {
    if(navigator.geolocation) {
        $sendLocationButton.setAttribute("disabled", "disabled")

        navigator.geolocation.getCurrentPosition((position) => {
            $sendLocationButton.removeAttribute("disabled")
            socket.emit("sendLocationEvent", {
                lat: position.coords.latitude,
                long: position.coords.longitude
            }, (error) => {
                if(error) {
                    console.log(error)
                } else {
                    console.log("location succesfully shared")
                }
            })
        }) //assincrono, mas não suporta promises ou async
    } else {
        alert("not supported in your browser/OS")
    }
})