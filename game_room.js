var _ = require('underscore');
var game = require('./game.js');

function gameRoom(io) {
  this.game = new game.game();
  this.id_str = this.generate_id_str(4);
  this.io = io;
  this.room_life = 10000; //Time before room is removed when no players present
  this.last_player_exit_at = Date.now();
}

gameRoom.prototype.generate_id_str = function(n) {
  var possible_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var str = "";
  for (var i = 0; i < n; i++) {
    str += _.sample(possible_chars);
  }
  return str;
}

gameRoom.prototype.broadcast_room = function(event_name, data) {
  this.io.to(this.id_str).emit(event_name, data);
}

gameRoom.prototype.current_player_count = function() {
  var count = 0;
  try {
    count = Object.keys(this.io.nsps["/"].adapter.rooms[this.id_str]).length;
  } finally {
    return count;
  }
}

gameRoom.prototype.join = function(player_socket) {
  console.log("player: " + player_socket.id + " is joining room: " + this.id_str);
  player_socket.join(this.id_str);

  player_socket.on('board', function(){
    console.log("Board selected");
    this.broadcast_room('game_state', this.game.game_state());
  }.bind(this));

  player_socket.on('clue_giver', function(){
    console.log("Clue giver selected");
    this.broadcast_room('clues', this.game.game_state(true));
  }.bind(this));

  player_socket.on('reveal', function(data) {
    console.log("revealing:", data);
    this.game.reveal(data);
    this.broadcast_room('game_state', this.game.game_state());
  }.bind(this));

  player_socket.on('reset', function() {
    this.game.reset();
    this.broadcast_room('game_state', this.game.game_state());
    this.broadcast_room('clues', this.game.game_state(true));
  }.bind(this));

  player_socket.on('pass_turn', function() {
    this.game.pass_turn();
    this.broadcast_room('game_state', this.game.game_state());
  }.bind(this));

  player_socket.on('play_pause', function() {
    this.game.play_pause();
    this.broadcast_room('game_state', this.game.game_state());
  }.bind(this));
  //Send the board to the new player 
  player_socket.emit('game_state', this.game.game_state());
  player_socket.emit('clues', this.game.game_state(true));

  player_socket.on('disconnect', function(){
    this.last_player_exit_at = Date.now();
    console.log('user disconnected from room: ' + this.name);
    console.log('Number of players: ' + this.current_player_count());
  }.bind(this));
}

gameRoom.prototype.should_be_removed = function() {
  var time_since_last_player = (Date.now() - this.last_player_exit_at);
  return this.current_player_count() == 0 && this.room_life < time_since_last_player;
}
exports.game_room = gameRoom;
