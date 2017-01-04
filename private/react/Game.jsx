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
      <div className="splash">
        <div className="splash-img-div">
          <img src="public/images/logo.png" />
        </div>
        <div className="splash-btns">
          <div onClick={ this.onClueGiverSelect }>
            <img src="public/images/icons/Display-Spymaster.png" />
          </div>
          <div onClick={ this.onBoardSelect }>
            <img src="public/images/icons/Display-Team.png" />
          </div>
        </div>
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

  renderScoreBoard () {
    if (this.state.player == "board") {
      var team_name = <span className={ [this.state.turn, "score", "turn", (this.state.turn == "one" ? "turn-one" : "turn-two")].join(' ') }>
        { this.state.turn == "one" ? "Party" : "Workers" }
      </span>;
    }
    return (<div className={ (this.state.player == "clue_giver" ? "controls" : "scoreboard") }>
      <span className={ "one score" + (this.state.turn == "one" ? " active" : "") }>
        { this.state.teamOneRemainingWords }
      </span>
      { team_name }
      <span className={ "two score" + (this.state.turn == "two" ? " active" : "") }>
        { this.state.teamTwoRemainingWords }
      </span>
    </div>);
  }

  renderGameBoard () {
    var board = this.state.gameState.map((row) => {
      return (<tr>{ row.map(this.formatWord) }</tr>);
    });
    return (<div>
      { this.renderScoreBoard() }
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

  handleReset() {
    this.props.socket.emit('reset');
  }

  handlePass() {
    this.props.socket.emit('pass_turn');
  }

  renderClueGiver () {
    var clue_rows = this.state.clues.map((row, i) => {
      return (<tr>{ row.map((word, j) => {
        var text = word.word.charAt(0).toUpperCase() + word.word.slice(1);
        return (<td
          onClick={ this.handleClueClick.bind(this, i, j) }
          key={ word.word }
          className={ "clue " + word.color }
        >{ this.state.gameState[i][j].color ? "" : text }</td>);
      }) }</tr>);
    });
    var controls = <div className="controls">
      <button onClick={ this.handleReset.bind(this) }>Reset</button>
      <button>Play</button>
      <button onClick={ this.handlePass.bind(this) }>Pass</button>
    </div>;
    return (<div className="clue-giver">
      { this.renderScoreBoard() }
      <div className="clue-wrapper center">
        <div className="clue-div">
          <table className="clue-table">{ clue_rows }</table>
        </div>
      </div>
      { controls }
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

