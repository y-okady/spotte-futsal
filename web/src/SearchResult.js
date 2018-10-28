import React, { Component } from 'react';
import './SearchResult.css';
import { Card, CardActionArea, CardContent, Typography } from '@material-ui/core';

class SearchResult extends Component {
  render() {
    return (
      <div className="SearchResult">
        {this.props.spots.map((spot, index) => {
          return (
            <Card key={`spot-${index}`} className="SearchResult-item">
              <CardActionArea>
                <CardContent>
                  <Typography variant="title" gutterBottom>
                    {spot.spot}
                  </Typography>
                  <Typography variant="body1">
                    空きコート: {spot.courts.join(', ')}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </div>
    );
  }
}

export default SearchResult;