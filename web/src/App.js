import React, { Component } from 'react';
import ReactSVG from 'react-svg';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import SearchForm from './SearchForm';
import SearchResult from './SearchResult';

library.add(faFutbol);
library.add(faSearch);
library.add(faSpinner);

const API_BASE_URL_PROD = 'https://s2cjc5s8a0.execute-api.ap-northeast-1.amazonaws.com/prod';
const API_BASE_URL = (() => {
  if (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')) {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return API_BASE_URL_PROD;
})();
const SEARCH_API_URL = API_BASE_URL + '/search';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spots: null,
      loading: false,
    };
  }

  prepareToSearch() {
    this.setState({
      spots: null,
      loading: true,
    });
  }

  search(condition) {
    axios.get(SEARCH_API_URL, {params: condition})
      .then(resp => {
        this.setState({
          spots: resp.data,
          loading: false,
        });
      })
      .catch(error => {
        console.log(error);
        alert('検索できませんでした');
        this.setState({
          loading: false
        });
      });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="App-logo">
            <ReactSVG src={logo} className="App-logo-logo" />
            <FontAwesomeIcon icon="futbol" size="lg" className="App-logo-icon" />
          </div>
          <SearchForm onBeforeSubmit={() => this.prepareToSearch()} onSubmit={condition => this.search(condition)} />
        </header>
        <SearchResult spots={this.state.spots} loading={this.state.loading} />
      </div>
    );
  }
}

export default App;