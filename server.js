var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('./public/js/underscore-min.js');
var game_room = require('./game_room.js');

var server_port = (process.env.PORT || 3000);

var game_rooms = {};

app.use("/public", express.static(__dirname + '/public'));

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log("Client connected!");
  socket.on('create', function() {
    var room = new game_room.game_room(io);
    game_rooms[room.id_str] = room;
    room.join(socket);
    socket.emit('room_success', room.id_str);
  });

  socket.on('join', function(room_id) {
    var room = game_rooms[room_id];
    if (room) {
      room.join(socket);
      socket.emit('room_success', room.id_str);
    } else {
      console.log("failed to join room: " + room_id);
      socket.emit('room_failed', room_id);
    }
  });
});


http.listen(server_port, function() {
  console.log('listening on *:' + String(server_port));
});
