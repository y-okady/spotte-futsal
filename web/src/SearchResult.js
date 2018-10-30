import React, { Component } from 'react';
import './SearchResult.css';

class SearchResult extends Component {
  render() {
    return (
      <div className="SearchResult">
        {this.props.spots.map((spot, index) => {
          return (
            <div key={`spot-${index}`} className="SearchResult-itemOuter">
              <div className="SearchResult-item">
                <h3 className="SearchResult-spot">
                  <a href={spot.url} target="_blank" rel="noopener noreferrer">{spot.spot}</a>
                </h3>
                <div className="SearchResult-courts">{spot.courts.join(', ')}</div>
                <div className="SearchResult-booking">
                  <a href={spot.bookingUrl} target="_blank" rel="noopener noreferrer">コートを予約する</a>
                </div>
                <div className="SearchResult-map">
                <iframe
                  title="Google Maps"
                  width="600"
                  height="450"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB1vbtwJx0IRSdjIH6LfnQrU1wxoLHIYwk&q=${spot.spot}`}
                  allowFullScreen />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default SearchResult;