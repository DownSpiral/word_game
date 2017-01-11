import React from 'react';
require('./Game.scss');
class Game extends React.Component {

  constructor(props) {
    super(props);
    if (this.props.roomId) {
      this.onJoinRoomSubmit(this.props.roomId);
    }
    window.onpopstate = (evt) => {
      if (window.location.pathname == "/" || (evt.state && evt.state.roomId)) {
        this.setState({
          roomId: null,
          clues: null,
          gameState: null,
          teamOneRemainingWords: null,
          teamOneRemainingTime: null,
          teamTwoRemainingWords: null,
          teamTwoRemainingTime: null,
          isPaused: null,
          isOver: null,
          turn: null,
          player: null
        });
        if (evt.state && evt.state.roomId) {
          this.onJoinRoomSubmit(evt.state.roomId);
        }
      }
    }
    this.state = {};
    this.onBoardSelect = this.onBoardSelect.bind(this);
    this.onClueGiverSelect = this.onClueGiverSelect.bind(this);
    this.onJoinRoomSubmit = this.onJoinRoomSubmit.bind(this);
    this.onJoinRoomSelect = this.onJoinRoomSelect.bind(this);
    this.onCreateRoom = this.onCreateRoom.bind(this);
    this.props.socket.on('room_success', (roomId) => {
      console.log("room_success");
      this.setState({
        selectingRole: true,
        loadingRoom: null,
        roomId: roomId,
        roomIdInputVal: null,
        joiningRoom: null
      });
      if (window.location.pathname != "/" + roomId) {
        window.history.pushState(
          { roomId: roomId },
          "Role select",
          window.location.origin + '/' + roomId
        );
      }
    });
    this.props.socket.on('room_failed', (failedRoomId) => {
      console.log("room_failed");
      this.setState({
        roomFailure: true,
        loadingRoom: null,
        failedRoomId: failedRoomId,
        roomIdInputVal: null
      });
    });
    this.props.socket.on('game_state', (data) => {
      this.setState({
        gameState: data.board,
        teamOneRemainingWords: data.team_data.one.remaining_words,
        teamOneRemainingTime: data.team_data.one.time,
        teamOneWins: data.team_data.one.wins,
        teamTwoRemainingWords: data.team_data.two.remaining_words,
        teamTwoRemainingTime: data.team_data.two.time,
        teamTwoWins: data.team_data.two.wins,
        isPaused: data.is_paused,
        isOver: data.is_over,
        turn: data.turn
      });
    });
    this.props.socket.on('clues', (data) => {
      this.setState({
        clues: data.board,
        teamOneRemainingWords: data.team_data.one.remaining_words,
        teamOneRemainingTime: data.team_data.one.time,
        teamOneWins: data.team_data.one.wins,
        teamTwoRemainingWords: data.team_data.two.remaining_words,
        teamTwoRemainingTime: data.team_data.two.time,
        teamTwoWins: data.team_data.two.wins,
        isPaused: data.is_paused,
        isOver: data.is_over,
        turn: data.turn
      });
    });
  }

  componentDidMount () {
    var intervalId = setInterval(this.timer.bind(this), 1000);
    this.setState({intervalId: intervalId});
  }

  componentWillUnmount () {
    clearInterval(this.state.intervalId);
  }

  timer () {
    if (this.state.isPaused == false && this.state.isOver == false) {
      if (this.state.turn == "one" && this.state.teamOneRemainingTime > 0) {
        var newState = { teamOneRemainingTime: this.state.teamOneRemainingTime - 1 };
        if (newState.teamOneRemainingTime <= 0) {
          newState.isOver = true;
          newState.turn = "two";
          newState.teamTwoWins = this.state.teamTwoWins + 1;
        }
        this.setState(newState);
      } else if (this.state.turn == "two" && this.state.teamTwoRemainingTime > 0) {
        var newState = { teamTwoRemainingTime: this.state.teamTwoRemainingTime - 1 };
        if (newState.teamTwoRemainingTime <= 0) {
          newState.isOver = true;
          newState.turn = "one";
          newState.teamOneWins = this.state.teamOneWins + 1;
        }
        this.setState(newState);
      }
    }
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

  onJoinRoomSelect () {
    this.setState({ joiningRoom: true });
  }

  onCreateRoom () {
    this.props.socket.emit('create');
    this.setState({ loadingRoom: true });
  }

  renderSplash () {
    var nav;
    var display = <img src="public/images/logo.png" />;
    if (this.state.loadingRoom) {
      nav = <div className="splash-btns"><div>Loading</div></div>;
    } else if (this.state.roomId) {
      display = (<div className="splash-btns room-id-container">
        <div className="room-id">{ this.state.roomId.toUpperCase() }</div>
      </div>);
      nav = this.renderPlayerSelection();
    } else if (this.state.joiningRoom) {
      nav = this.renderJoinRoom();
    } else {
      nav = this.renderRoomSelection();
    }
    return (
      <div className="splash">
        <div className="splash-img-div">
          { display }
        </div>
        { nav }
      </div>
    );
  }

  onJoinRoomSubmit (roomId) {
    this.props.socket.emit('join', roomId);
    this.setState({ loadingRoom: true });
  }

  handleRoomIdInput (evt) {
    var nextInputVal = evt.target.value.toUpperCase();
    this.setState({ roomIdInputVal: nextInputVal });
    if (nextInputVal.length > 3) {
      this.onJoinRoomSubmit(nextInputVal);
      this.refs.roomIdInput.blur();
    }
  }

  renderJoinRoom () {
    var failureMessage;
    if (this.state.failedRoomId) {
      failureMessage = (<div className="fail-message">{ "Invalid Room: " + this.state.failedRoomId }</div>);
    }
    return (
      <div className="splash-btns room-id-selection">
        { failureMessage }
        <input
          className="room-id-input"
          value={ this.state.roomIdInputVal }
          size={ 4 }
          maxLength={ 4 }
          type="text"
          onChange={ this.handleRoomIdInput.bind(this) }
          autoComplete="off"
          ref="roomIdInput"
          autoFocus
        />
      </div>
    );
  }

  renderRoomSelection () {
    return (
      <div className="splash-btns">
        <div onClick={ this.onCreateRoom }>
          Create Room
        </div>
        <div onClick={ this.onJoinRoomSelect }>
          Join Room
        </div>
      </div>
    );
  }

  renderPlayerSelection () {
    return (
      <div className="splash-btns">
        <div onClick={ this.onClueGiverSelect }>
          <img src="public/images/icons/Display-Spymaster.png" />
        </div>
        <div onClick={ this.onBoardSelect }>
          <img src="public/images/icons/Display-Team.png" />
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
    return (<td key={ word.word } className={ "no-select card " + (word.color || "") }>
      <span className={ should_hide ? "hidden" : "" }>{ text }</span>
    </td>);
  }

  formatTime (seconds) {
    var m = String(Math.floor(seconds/60));
    var s = String(seconds % 60);
    return m + ":" + (s.length > 1 ? "" : "0") + s;
  }

  renderVictoryScreen () {
    return (<div className={ (this.state.player == "clue_giver" ? "controls" : "scoreboard") }>
      <span className={ "score one" }>
        { this.state.teamOneWins }
      </span>
      <span className={ "score " + this.state.turn }>
        { (this.state.turn == "one" ? "Communists" : "Capitalists") + " Win!" }
      </span>
      <span className={ "score two" }>
        { this.state.teamTwoWins }
      </span>
    </div>);
  }

  renderScoreBoard () {
    if (this.state.player == "board") {
      var team_name = <span className={ [this.state.turn, "score", "turn", (this.state.turn == "one" ? "turn-one" : "turn-two")].join(' ') }>
        { this.state.turn == "one" ? "Communists" : "Capitalists" }
      </span>;
    }
    var team_one_time = <span className={ "one time score" + (this.state.turn == "one" ? " active" : "") }>
      { this.formatTime(this.state.teamOneRemainingTime) }
    </span>;
    var team_two_time = <span className={ "two time score" + (this.state.turn == "two" ? " active" : "") }>
      { this.formatTime(this.state.teamTwoRemainingTime) }
    </span>;
    return (<div className={ (this.state.player == "clue_giver" ? "controls" : "scoreboard") }>
      { team_one_time }
      <span className={ "one score" + (this.state.turn == "one" ? " active" : "") }>
        { this.state.teamOneRemainingWords }
      </span>
      { team_name }
      <span className={ "two score" + (this.state.turn == "two" ? " active" : "") }>
        { this.state.teamTwoRemainingWords }
      </span>
      { team_two_time }
    </div>);
  }

  renderGameBoard () {
    var board = this.state.gameState.map((row) => {
      return (<tr>{ row.map(this.formatWord) }</tr>);
    });
    var topDisplay;
    if (this.state.isOver) {
      topDisplay = this.renderVictoryScreen();
    } else {
      topDisplay = this.renderScoreBoard();
    }
    return (<div>
      { topDisplay }
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

  handlePlayPause() {
    this.props.socket.emit('play_pause');
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
    var controlButtons = [<button onClick={ this.handleReset.bind(this) }>Reset</button>];
    if (!this.state.isOver) {
      controlButtons = controlButtons.concat([
        <button onClick={ this.handlePlayPause.bind(this) }>{ this.state.isPaused ? "Play" : "Pause" }</button>,
        <button onClick={ this.handlePass.bind(this) }>Pass</button>
      ]);
    }
    var controls = <div className="controls">
      { controlButtons }
    </div>;
    var topDisplay;
    if (this.state.isOver) {
      topDisplay = this.renderVictoryScreen();
    } else {
      topDisplay = this.renderScoreBoard();
    }
    return (<div className="clue-giver">
      { topDisplay }
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
      game = this.renderSplash();
    }
    return game;
  }

}

export default Game;

