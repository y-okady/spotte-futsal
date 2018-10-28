import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SearchForm from './SearchForm';
import SearchResult from './SearchResult';
import axios from 'axios';

const SEARCH_API_URL = 'https://qxkhhtc4d0.execute-api.ap-northeast-1.amazonaws.com/dev/search';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spots: [],
    };
  }

  search(condition) {
    axios.get(SEARCH_API_URL, {params: condition})
      .then(resp => {
        this.setState({
          spots: resp.data,
        })
      })
      .catch(error => {
        console.error(error);
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