const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

let users = []

const messages = {
    general: [], 
    random: [], 
    jokes: [], 
    javascript: []
}

// everytime someone "connects to the server" a new "socket" is created
io.on('connection', socket => {
    socket.on('join server', (username) => {
        const user = {    // building a user with the username (that is passed in) and the socket id
            username, 
            id: socket.id,
        };
        users.push(user);   // then pushing the created user into the users array 
        io.emit("new user", users);   // let's all users connected to the server that a new socket has been created and added to the users array 
    });

    socket.on('join room', (roomName, cb) => {
        socket.join(roomName);
        cb(messages[roomName]);
    });

    socket.on('send message', ({ content, to, sender, chatName, isChannel }) => {
        if (isChannel) {
            const payload = {
                content, 
                chatName, 
                sender,
            };
            socket.to(to).emit('new message', payload);
        } else {
            const payload = {
                content, 
                chatName: sender, 
                sender
            };
            socket.to(to).emit('new message', payload);
        }
        if (messages[chatName]) {
            messages[chatName].push({
                sender, 
                content
            });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('new user', users);
    });

});

server.listen(1337, () => console.log('server is running on port 1337'));