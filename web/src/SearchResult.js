import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import './SearchResult.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB1vbtwJx0IRSdjIH6LfnQrU1wxoLHIYwk';

class SearchResult extends Component {
  render() {
    return (
      <div className="SearchResult">
        {this.props.loading ?
          <Loading className="SearchResult-loading" /> : null}
        {this.props.spots && this.props.spots.length === 0 ?
          <div className="SearchResult-noitem">予約できるコートが見つかりません。</div> : null}
        {this.props.spots && this.props.spots.map((spot, index) => {
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
                  <iframe title="Google マップ" width="600" height="450" frameBorder="0" allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${spot.spot}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

SearchResult.propTypes = {
  loading: PropTypes.bool,
  spots: PropTypes.array,
};

export default SearchResult;