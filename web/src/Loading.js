import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Loading.css';

class Loading extends Component {
  render() {
    return (
      <FontAwesomeIcon icon="spinner" size="2x" className={`Loading ${this.props.className}`} />
    );
  }
}

Loading.propTypes = {
  className: PropTypes.string,
};

export default Loading;