import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import 'flatpickr/dist/themes/material_green.css';
import './SearchForm.css';

// 大阪駅
const DEFAULT_LAT = 34.702485;
const DEFAULT_LON = 135.495951;

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datetime: moment().add(1, 'days').hour(19).minute(0),
      hour: '2',
    };
  }

  _getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onBeforeSubmit();
    this.setState({
      height: '0px',
    });
    this._getCurrentPosition()
      .then(pos => [pos.coords.latitude, pos.coords.longitude])
      .catch(() => [DEFAULT_LAT, DEFAULT_LON])
      .then(pos => {
        this.props.onSubmit({
          date: this.state.datetime.format('YYYY-MM-DD'),
          time: this.state.datetime.format('HH:mm'),
          hour: this.state.hour,
          lat: pos[0],
          lon: pos[1],
        });
      });
  }

  handleHourChange(event) {
    this.setState({
      hour: event.target.value,
    });
  }

  handleDateTimeChange(event) {
    this.setState({
      datetime: moment(event[0])
    });
  }

  componentDidMount() {
    this.setState({
      height: (window.innerHeight - 60) + 'px',
    });
  }

  render() {
    return (
      <div className="SearchForm" style={{minHeight: this.state.height}}>
        <h2 className="SearchForm-title" style={{display: this.state.titleDisplay}}>フットサルコート空き時間検索</h2>
        <form className="SearchForm-form" onSubmit={event => this.handleSubmit(event)}>
          <div className="SearchForm-inputs">
            <Flatpickr value={this.state.datetime.toDate()} onChange={event => this.handleDateTimeChange(event)}
              options={{
                enableTime: true,
                time_24hr: true,
                minuteIncrement: 30,
              }} />
            <span>から</span>
            <select id="hour" value={this.state.hour} onChange={event => this.handleHourChange(event)}>
              <option value="1">1時間</option>
              <option value="1.5">1時間半</option>
              <option value="2">2時間</option>
              <option value="2.5">2時間半</option>
              <option value="3">3時間</option>
              <option value="4">4時間</option>
              <option value="5">5時間</option>
              <option value="6">6時間</option>
            </select>
          </div>
          <div className="SearchForm-desc">
            <span>予約できるコート</span>
          </div>
          <div className="SearchForm-buttons">
            <button type="submit" className="SearchForm-button">
              <FontAwesomeIcon icon="search" size="1x" />検索する
            </button>
          </div>
        </form>
      </div>
    );
  }
}

SearchForm.propTypes = {
  onBeforeSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default SearchForm;