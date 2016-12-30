var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('./public/js/underscore-min.js');
var game = require('./game.js');

var server_port = (process.env.PORT || 3000);

app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

game = new game.game();

io.on('connection', function(socket) {
  console.log("Client connected!");

  socket.on('board', function(socket){
    console.log("Board selected");
    io.emit('game_state', { board: game.get_board_state() });
  });

  socket.on('clue_giver', function(socket){
    console.log("Clue giver selected");
    io.emit('clues', { clues: game.get_clues() });
  });

  socket.on('reveal', function(data) {
    console.log("revealing:", data);
    game.reveal(data);
    io.emit('game_state', { board: game.get_board_state() });
  });
});


http.listen(server_port, function() {
  console.log('listening on *:' + String(server_port));
});
