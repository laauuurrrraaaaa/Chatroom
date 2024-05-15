const express = require('express');
const app = express();

const path = require('path');
const http = require('http');
const socket = require('socket.io');
const server = http.createServer(app);
const parseURL = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const mysql = require('mysql');

const formatMessage = require('./util/messages');
const {userJoin, getCurrentUser} = require('./util/users');

const io = socket(server);
const PORT = 8080;

let encodeURL = parseURL.urlencoded({extended: false});


app.use(express.static(path.join(__dirname, 'public')));//public folder is static

//session middleware
app.use(sessions({
    secret: "",
    saveUnitialized: true,
    cookie:{},
    resave: false
}));

app.use(cookieParser());

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chat"
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
})

app.post('/register', encodeURL, (req, res) => {
    var userName = req.body.userName;
    var password = req.body.password;

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        // checking user already registered or no
        con.query(`SELECT * FROM users WHERE username = '${userName}' AND password  = '${password}'`, function(err, result){
            if(err){
                console.log(err);
            };
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/failReg.html');
            }else{
            //creating user page in userPage function
            function userPage(){
                // We create a session for the dashboard (user page) page and save the user data to this session:
                req.session.user = {
                    username: userName,
                    password: password 
                };

                res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Login and register form with Node.js, Express.js and MySQL</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body>
                    <div class="container">
                        <h3>Hi, ${req.session.user.username}</h3>
                        <a href="/">Log out</a>
                    </div>
                </body>
                </html>
                `);
            }
                // inserting new user data
                var sql = `INSERT INTO users (username, password) VALUES ('${userName}', '${password}')`;
                con.query(sql, function (err, result) {
                    if (err){
                        console.log(err);
                    }else{
                        // using userPage function for creating user page
                        userPage();
                    };
                });

        }

        });
    });


});


io.on('connection', socket => {
    // console.log("User connected", socket.id);
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