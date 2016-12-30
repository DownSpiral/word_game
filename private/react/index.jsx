import React from 'react';
import {render} from 'react-dom';
import Game from './Game.jsx'

var socket = io();

class App extends React.Component {
  render () {
    return (
      <div>
        <Game socket={ socket }/>
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));

