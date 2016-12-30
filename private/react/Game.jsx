import React from 'react';
require('./Game.scss');
class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = { likesCount : 0 };
    this.onBoardSelect = this.onBoardSelect.bind(this);
    this.onClueGiverSelect = this.onClueGiverSelect.bind(this);
    this.props.socket.on('game_state', (data) => {
      this.setState({
        gameState: data.board,
        teamOneRemainingWords: data.team_data.one.remaining_words,
        teamTwoRemainingWords: data.team_data.two.remaining_words,
        isPaused: data.is_paused,
        isOver: data.is_over,
        turn: data.turn
      });
    });
    this.props.socket.on('clues', (data) => {
      this.setState({
        clues: data.board,
        teamOneRemainingWords: data.team_data.one.remaining_words,
        teamTwoRemainingWords: data.team_data.two.remaining_words,
        isPaused: data.is_paused,
        isOver: data.is_over,
        turn: data.turn
      });
    });
  }

  onBoardSelect () {
    this.props.socket.emit('board', {});
    this.setState({ player: 'board' });
  }

  onClueGiverSelect () {
    this.props.socket.emit('clue_giver', {});
    this.setState({ player: 'clue_giver' });
    console.log('harg');
  }

  renderPlayerSelection () {
    return (
      <div className="center">
        <button className="select-btn" onClick={ this.onBoardSelect }>Board</button>
        <button className="select-btn" onClick={ this.onClueGiverSelect }>Clue giver</button>
      </div>
    );
  }

  formatWord (word) {
    var text = word.word.charAt(0).toUpperCase() + word.word.slice(1);
    if (word.color == "civ") {
      text = "X";
    }
    var should_hide = word.color && (word.color != "civ" && word.color != "assassin");
    return (<td key={ word.word } className={ "card " + (word.color || "") }>
      <span className={ should_hide ? "hidden" : "" }>{ text }</span>
    </td>);
  }

  renderGameBoard () {
    var board = this.state.gameState.map((row) => {
      return (<tr>{ row.map(this.formatWord) }</tr>);
    });
    var score = <div className="scoreboard">
      <span className="red score">{ this.state.teamOneRemainingWords }</span>
      <span className={ this.state.turn + " score" }>{ this.state.turn == "red" ? "\u21D0" : "\u21D2" }</span>
      <span className="blue score">{ this.state.teamTwoRemainingWords }</span>
    </div>;
    return (<div>
      { score }
      <div className="game-div">
        <div className="center">
          <table className="game-table">{ board }</table>
        </div>
      </div>
    </div>);
  }

  handleClueClick(i, j) {
    this.props.socket.emit('reveal', { x: j, y: i });
  }

  renderClueGiver () {
    var clue_rows = this.state.clues.map((row, i) => {
      return (<tr>{ row.map((word, j) => {
        return (<td
          onClick={ this.handleClueClick.bind(this, i, j) }
          key={ word.word }
          className={ "clue " + word.color }
        />);
      }) }</tr>);
    });
    return (<div className="center">
      <div className="clue-div">
        <table className="clue-table">{ clue_rows }</table>
      </div>
    </div>);
  }

  render() {
    var game;
    if (this.state.player == "board" && this.state.gameState) {
      game = this.renderGameBoard();
    } else if (this.state.player == "clue_giver" && this.state.clues) {
      game = this.renderClueGiver();
    } else {
      game = this.renderPlayerSelection();
    }
    return game;
  }

}

export default Game;

