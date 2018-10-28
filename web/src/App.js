import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SearchForm from './SearchForm';
import SearchResult from './SearchResult';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spots: [],
    };
  }

  search(condition) {
    console.log(condition);
    this.setState({
      spots: [1],
    });
  }

  render() {
    return (
      <div className="App">
        <header>
          Spotte Futsal
        </header>
        <SearchForm onSubmit={condition => this.search(condition)}/>
        <SearchResult spots={this.state.spots} />
      </div>
    );
  }
}

export default App;