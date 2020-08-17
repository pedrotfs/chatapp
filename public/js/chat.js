const socket = io()

const $form = document.querySelector("form")
const $input = $form.querySelector("#messageInput")
const $button = $form.querySelector("#sendMessage")
const $sendLocationButton = document.querySelector("#sendLocation")
const $messages = document.querySelector("#messages")

const messageTemplate = document.querySelector("#messageTemplate").innerHTML
const messageLocationTemplate = document.querySelector("#messageLocationTemplate").innerHTML
const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) //ignora ? em queries de busca

const autoscroll = () => {
    //altura da mensagem nova
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //altura visivel
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    //quantidade de scroll
    const scrollOffset = ($messages.scrollTop+visibleHeight)*2

    if(containerHeight - newMessageHeight < scrollOffset) { //vendo msg -1 -> indica se tá na ultima mensagem
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message", (message) => {
    console.log(message)
    $messages.insertAdjacentHTML("beforeend", Mustache.render(messageTemplate, {
        username: message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format("hh:mm:ss")
    }))
    autoscroll()
})

socket.on("sendLocationMessageEvent", (message) => {
    console.log(message)
    $messages.insertAdjacentHTML("beforeend", Mustache.render(messageLocationTemplate, {
        username: message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format("hh:mm:ss")
    }))
    autoscroll()
})

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
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

socket.emit("join", {username, room}, (error) => {
    if(error) {
        console.log(error)
        alert(error)
        location.href = "/"
    }
})