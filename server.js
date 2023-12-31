const express = require('express');
const app = express();

const path = require('path');
const http = require('http');
const socket = require('socket.io');
const server = http.createServer(app);

const formatMessage = require('./util/messages');
const {userJoin, getCurrentUser} = require('./util/users');

const io = socket(server);
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));//public folder is static

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username);

        socket.join(user.room);

        socket.emit('message', formatMessage('Bot', 'welcome to chat'));

        //broadcast to all users when a new user join the chat
        socket.broadcast.emit('message', formatMessage('Bot', `${user.username} connected to the chat`));

        //leave a msg when a user disconnects
        socket.on('disconnect', () => {
            io.emit('message', formatMessage('Bot', `${user.username} has left the chat`));
        });
    });

    //listen for chat msg
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);

        io.emit("message", formatMessage(user.username, msg));
      });
});


server.listen(PORT, () =>
    console.log("Server running on port " + PORT)   
);

