const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

//get username and room from url
const {username} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(username);

const socket = io();

//joint chatroom
socket.emit('joinRoom',{username})

//output msg from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //auto scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//record chat msg in console
chatForm.addEventListener('submit', (e) =>{
    e.preventDefault();

    //get msg text
    const msg = e.target.elements.msg.value;

    // console.log(msg);
    socket.emit('chatMessage', msg);

    //clear input after send
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

//output message to DOM, "message" now as an object
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}