import React, { Component } from 'react';
import './SearchResult.css';

class SearchResult extends Component {
  render() {
    return (
      <div className="SearchResult">
        {this.props.spots.map((spot, index) => {
          return (
            <div key={`spot-${index}`} className="SearchResult-item">
              <h3 className="SearchResult-spot">
                <a href={spot.url} target="_blank">{spot.spot}</a>
              </h3>
              <div className="SearchResult-courts">{spot.courts.join(', ')}</div>
              <div className="SearchResult-booking">
                <a href={spot.bookingUrl} target="_blank">コートを予約する</a>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default SearchResult;