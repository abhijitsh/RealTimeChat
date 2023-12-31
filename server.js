
const path = require( 'path');
const http = require('http');
const express = require( 'express');
const socketio = require('socket.io');
const formatMessage = require( './utils/messages')
const {userJoin, getCurrentUser,getRoomUsers} = require( './utils/users')


const app = express() ;
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use( express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket =>{
    // console.log('new WS connection...');
    socket.on('joinRoom',({ username, room}) =>{
        const user = userJoin(socket.id,username, room);

        socket.join(user.room);
         // welcome current user
    socket.emit('message', formatMessage('ChatBot','Welcome to the Chatroom'));

    // broadcast when user connects
    socket.broadcast
    .to(user.room)
    .emit('message', formatMessage('ChatBot',`${user.username} has connected`));

    // send users and room info
    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    });

    });
     
    
    // Listen for Chat Message
    socket.on('chatMessage', msg =>{
        // console.log(msg); 
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username,msg)); 
    });

    //Runs when client disconnects
    socket.on('disconnect', ()=>{
        io.emit('message', formatMessage('ChatBot',`${user.username} has left the chat`));
    });
});

const PORT = 3000 || process.env. PORT;
server. listen (PORT, () => console. log(`Server running on port ${PORT}`));