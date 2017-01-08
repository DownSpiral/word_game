var _ = require('underscore');
var nouns = require('./nouns_short.js');

function game() {
  this.initialize();
}

game.prototype.initialize = function() {
  this.guessing_players = {};
  this.spy_master_players = {};
  this.words = this.generate_words();
  if (this.first_turn) {
    this.first_turn = (this.first_turn == "one" ? "two" : "one")
  } else {
    this.first_turn = _.sample(['one', 'two']);
  }
  this.turn = this.first_turn + "";
  this.card = this.generate_card(this.turn);
  this.guess_state = this.generate_initial_guess_state();
  this.score = { one: 0, two: 0 };
  this.is_over = false;
  this.is_paused = true;
  this.last_move_made_at = null;
  var game_time = 60 * 20;
  this.team_data = {
    one: { time: game_time/2, remaining_words: 8 + (this.turn == 'one' ? 1 : 0) },
    two: { time: game_time/2, remaining_words: 8 + (this.turn == 'two' ? 1 : 0) }
  };
}

game.prototype.generate_words = function() {
  var words = _.sample(nouns.nouns_short_list, 25);
  return _.values(_.groupBy(words, function(v, i) { return i % 5; }));
}

game.prototype.generate_initial_guess_state = function() {
  var state = [];
  for (var i = 0; i < 5; i++) {
    var inner_state = [];
    for (var j = 0; j < 5; j++) {
      inner_state[j] = 0;
    }
    state[i] = inner_state;
  }
  return state;
}

game.prototype.generate_card = function(starting_color) {
  var one_count = 8 + (starting_color == 'one' ? 1 : 0);
  var two_count = 8 + (starting_color == 'two' ? 1 : 0);
  var card = ['assassin'];
  for (var i = 0; i < 7; i++) {
    card = card.concat('civ');
  }
  for (var i = 0; i < one_count; i++) {
    card = card.concat('one');
  }
  for (var i = 0; i < two_count; i++) {
    card = card.concat('two');
  }
  card = _.shuffle(card);
  return  _.values(_.groupBy(card, function(v, i) { return i % 5; }));
}

game.prototype.get_board_state = function(with_clues) {
  return this.words.map(function(row, i) {
    return row.map(function(word, j) {
      return {
        word: word,
        color: ((this.guess_state[i][j] == 1 || with_clues) ? this.card[i][j] : null)
      };
    }, this);
  }, this);
}

game.prototype.reveal = function(coords) {
  if (!this.is_paused && this.guess_state[coords.y][coords.x] == 0) {
    this.guess_state[coords.y][coords.x] = 1;
    if (this.card[coords.y][coords.x] != this.turn) {
      this.pass_turn();
      if (this.card[coords.y][coords.x] == this.turn) {
        this.team_data[this.turn].remaining_words -= 1;
      }
      if (this.card[coords.y][coords.x] == "assassin") {
        this.is_over = true;
      }
    } else {
      this.team_data[this.turn].remaining_words -= 1;
      this.decrement_time();
    }
  }
}

game.prototype.reset = function() {
  this.initialize();
}

game.prototype.play_pause = function() {
  if (this.is_paused) {
    this.last_move_made_at = Date.now();
  } else {
    this.decrement_time();
    this.last_move_made_at = null;
  }
  this.is_paused = !this.is_paused;
}

game.prototype.decrement_time = function() {
  var now = Date.now();
  this.team_data[this.turn].time -= Math.floor((now - this.last_move_made_at)/1000);
  if (this.team_data[this.turn].time < 0) {
    this.team_data[this.turn].time = 0;
  }
  this.last_move_made_at = now;
}

game.prototype.pass_turn = function() {
  if (!this.is_paused) {
    this.decrement_time();
    this.turn = (this.turn == "one" ? "two" : "one")
  }
}

game.prototype.game_state = function(with_clues) {
  //Make a fake move so that players that join mid game have an accurate clock
  var team_data_copy = {
    one: _.extend({}, this.team_data.one),
    two: _.extend({}, this.team_data.two)
  };
  if (this.last_move_made_at) {
    team_data_copy[this.turn].time -= Math.floor((Date.now() - this.last_move_made_at)/1000);
  }

  return {
    board: this.get_board_state(with_clues),
    team_data: team_data_copy,
    is_over: this.is_over,
    is_paused: this.is_paused,
    turn: this.turn
  };
}

exports.game = game;
