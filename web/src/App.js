import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import SearchForm from './SearchForm';
import SearchResult from './SearchResult';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol, faSearch } from '@fortawesome/free-solid-svg-icons'

library.add(faFutbol)
library.add(faSearch)

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
        <header className="App-header">
          <div className="App-logo">
            <img src={logo} alt="logo" />
            <FontAwesomeIcon icon="futbol" size="lg" />
          </div>
          <SearchForm onSubmit={condition => this.search(condition)}/>
        </header>
        <SearchResult spots={this.state.spots} />
      </div>
    );
  }
}

export default App;