import React from 'react';
require('./Game.scss');
class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = { likesCount : 0 };
    this.onBoardSelect = this.onBoardSelect.bind(this);
    this.onClueGiverSelect = this.onClueGiverSelect.bind(this);
    this.props.socket.on('game_state', (data) => {
      this.setState({ gameState: data.board });
    });
    this.props.socket.on('clues', (data) => {
      console.log(data);
      this.setState({ clues: data.clues });
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
    return (<td key={ word.word } className={ "card " + (word.color || "") }><span className={ word.color ? "hidden" : "" }>{ word.word.toUpperCase() }</span></td>);
  }

  renderGameBoard () {
    var board = this.state.gameState.map((row) => {
      return (<tr>{ row.map(this.formatWord) }</tr>);
    });
    var counter = <div className="scoreboard"><span>Red: 5</span><span>Blue: 6</span></div>;
    return (<div>{ counter }<div className="center"><table className="game-table">{ board }</table></div></div>);
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

