var _ = require('underscore');
var nouns = require('./nouns_short.js');

function game() {
  this.initialize();
}

game.prototype.initialize = function() {
  this.guessing_players = {};
  this.spy_master_players = {};
  this.words = this.generate_words();
  this.turn = _.sample(['red', 'blue']);
  this.card = this.generate_card(this.turn);
  this.guess_state = this.generate_initial_guess_state();
  this.score = { red: 0, blue: 0 };
  this.is_over = false;
  this.is_paused = true;
  var game_time = 60 * 20;
  this.team_data = {
    one: { time: game_time/2, remaining_words: 8 + (this.turn == 'red' ? 1 : 0) },
    two: { time: game_time/2, remaining_words: 8 + (this.turn == 'blue' ? 1 : 0) }
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
  var red_count = 8 + (starting_color == 'red' ? 1 : 0);
  var blue_count = 8 + (starting_color == 'blue' ? 1 : 0);
  var card = ['assassin'];
  for (var i = 0; i < 7; i++) {
    card = card.concat('civ');
  }
  for (var i = 0; i < red_count; i++) {
    card = card.concat('red');
  }
  for (var i = 0; i < blue_count; i++) {
    card = card.concat('blue');
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
  if (this.guess_state[coords.y][coords.x] == 0) {
    this.guess_state[coords.y][coords.x] = 1;
    if (this.card[coords.y][coords.x] != this.turn) {
      this.turn = (this.turn == "red" ? "blue" : "red");
      if (this.card[coords.y][coords.x] == this.turn) {
        this.team_data[this.turn == "red" ? "one" : "two"].remaining_words -= 1;
      }
      if (this.card[coords.y][coords.x] == "assassin") {
        this.is_over = true;
      }
    } else {
      this.team_data[this.turn == "red" ? "one" : "two"].remaining_words -= 1;

    }
  }
}

game.prototype.reset = function() {
  this.initialize();
}

game.prototype.game_state = function(with_clues) {
  return {
    board: this.get_board_state(with_clues),
    team_data: this.team_data,
    is_over: this.is_over,
    is_paused: this.is_paused,
    turn: this.turn
  };
}

exports.game = game;
