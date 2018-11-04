import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SearchForm from './SearchForm';
import SearchResult from './SearchResult';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons'
import ReactSVG from 'react-svg'

library.add(faFutbol)
library.add(faSearch)
library.add(faSpinner)

const SEARCH_API_URL = 'https://s2cjc5s8a0.execute-api.ap-northeast-1.amazonaws.com/prod/search';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spots: [],
      loading: false,
      searched: false,
    };
  }

  search(condition) {
    this.setState({
      spots: [],
      loading: true,
    });
    axios.get(SEARCH_API_URL, {params: condition})
      .then(resp => {
        this.setState({
          spots: resp.data,
          loading: false,
          searched: true,
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
            <ReactSVG
              src={logo}
              className="App-logo-logo" />
            <FontAwesomeIcon
              icon="futbol"
              size="lg"
              className="App-logo-icon" />
          </div>
          <SearchForm onSubmit={condition => this.search(condition)}/>
        </header>
        {this.state.searched ?
          <SearchResult spots={this.state.spots} loading={this.state.loading} /> : null}
      </div>
    );
  }
}

export default App;