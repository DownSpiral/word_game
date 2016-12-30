var _ = require('underscore');
var nouns = require('./nouns.js');

function game() {
  this.guessing_players = {};
  this.spy_master_players = {};
  this.words = this.generate_words();
  this.turn = _.sample(['red', 'blue']);
  this.card = this.generate_card(this.turn);
  this.guess_state = this.generate_initial_guess_state();
  this.score = { red: 0, blue: 0 };
  this.is_over = false;
}

game.prototype.generate_words = function() {
  var words = _.sample(nouns.nouns, 25);
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

game.prototype.get_clues = function() {
  return this.get_board_state(true);
}

game.prototype.reveal = function(coords) {
  this.guess_state[coords.y][coords.x] = 1;
}

exports.game = game;
