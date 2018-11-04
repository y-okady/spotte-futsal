import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Loading.css'

class Loading extends Component {
  render() {
    return (
      <FontAwesomeIcon
        icon="spinner"
        size="2x"
        className={`Loading ${this.props.className}`}
      />
    );
  }
}

export default Loading;