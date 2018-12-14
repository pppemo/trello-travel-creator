import React, { Component } from 'react'
import Trello from './api/trello'
import AddFlight from './containers/AddFlight'
import './App.css'

class App extends Component {
  componentDidMount() {
    Trello.authorize()
  }
  
  render() {
    return (
      <div className="App">
        <AddFlight />
      </div>
    );
  }
}

export default App;
