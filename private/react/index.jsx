import React from 'react';
import {render} from 'react-dom';
import Game from './Game.jsx'

var socket = io();

class App extends React.Component {
  render () {
    return (
      <div>
        <Game
          socket={ socket }
          roomId={ window.location.pathname.slice(1, window.location.pathname.length) } 
        />
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));

