import React, { Component } from 'react';

class SearchResult extends Component {
  renderCourts(courts) {
    return (
      <ul>
        {courts.map((court, index) => {
          return (
            <li key={`court-${index}`}>
              {court}
            </li>
          );
        })}
      </ul>
    )
  }
  render() {
    return (
      <div className="SearchResult">
        <ul>
          {this.props.spots.map((spot, index) => {
            return (
              <li key={`spot-${index}`}>
                {spot.spot}
                {this.renderCourts(spot.courts)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default SearchResult;