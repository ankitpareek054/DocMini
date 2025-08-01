const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};

io.on('connection', (socket) => {
    socket.on('join-room', ({ username, room }) => {
        if (!rooms[room]) rooms[room] = {};
        socket.join(room);
        socket.room = room;
        socket.username = username;
        socket.emit('doc-list', Object.keys(rooms[room]));
    });

    socket.on('create-document', ({ docName }) => {
        const room = socket.room;
        if (!rooms[room][docName]) {
            rooms[room][docName] = { content: '' };
            io.to(room).emit('doc-list', Object.keys(rooms[room]));
        }
    });

    socket.on('open-document', ({ docName }) => {
        const room = socket.room;
        if (rooms[room][docName]) {
            socket.emit('init', { docName, content: rooms[room][docName].content });
        }
    });

    socket.on('content-change', ({ docName, content }) => {
        const room = socket.room;
        if (rooms[room][docName]) {
            rooms[room][docName].content = content;
            socket.to(room).emit('update-content', { docName, content });
        }
    });

    socket.on('typing', ({ docName }) => {
        const room = socket.room;
        const username = socket.username;
        socket.to(room).emit('user-typing', { docName, username });
    });

    socket.on('disconnect', () => {});
});

app.use(express.static(path.join(__dirname, '../client')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
