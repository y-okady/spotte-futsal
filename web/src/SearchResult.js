import React, { Component } from 'react';
import './SearchResult.css';

class SearchResult extends Component {
  render() {
    return (
      <div className="SearchResult">
        {this.props.spots.map((spot, index) => {
          return (
            <div key={`spot-${index}`} className="SearchResult-item">
              <h3 className="SearchResult-spot">{spot.spot}</h3>
              <span className="SearchResult-courts">{spot.courts.join(', ')}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default SearchResult;