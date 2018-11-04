import React, { Component } from 'react';
import './SearchForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'flatpickr/dist/themes/material_green.css'
import Flatpickr from 'react-flatpickr';
import moment from 'moment';

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datetime: moment().add(1, 'days').hour(19).minute(0),
      hour: '2',
    };
  }

  handleSubmit = event => {
    event.preventDefault();
    this.props.onSubmit({
      date: this.state.datetime.format('YYYY-MM-DD'),
      time: this.state.datetime.format('HH:mm'),
      hour: this.state.hour,
    })
    this.setState({
      height: '0px',
    });
  }

  handleHourChange = event => {
    this.setState({
      hour: event.target.value,
    })
  }

  handleDateTimeChange = event => {
    this.setState({
      datetime: moment(event[0])
    })
  }

  componentWillMount() {
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
            <Flatpickr
              value={this.state.datetime.toDate()}
              options={{
                enableTime: true,
                time_24hr: true,
                minuteIncrement: 30,
              }}
              onChange={this.handleDateTimeChange}
            />
            <span>から</span>
            <select
              id="hour"
              onChange={this.handleHourChange}
              value={this.state.hour}
            >
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
            <button
              type="submit"
              className="SearchForm-button"
            >
              <FontAwesomeIcon icon="search" size="1x" />
              検索する
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default SearchForm;