import React, { Component } from 'react';
import { TextField, Button } from '@material-ui/core';
import './SearchForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class SearchForm extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    this.state = {
      date: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
      time: '19:00',
      hour: 2,
    };
  }

  handleSubmit = event => {
    event.preventDefault();
    const { date, time, hour } = this.state;
    this.props.onSubmit({ date, time, hour })
  }

  handleChange = (name, event) => {
    this.setState({
      [name]: event.target.value,
    })
  }

  render() {
    return (
      <div className="SearchForm">
        <h2 className="SearchForm-title">フットサルコート空き時間検索</h2>
        <form className="SearchForm-form" onSubmit={event => this.handleSubmit(event)}>
          <div className="SearchForm-inputs">
            <TextField
              id="date"
              type="date"
              value={this.state.date}
              onChange={event => this.handleChange('date', event)}
            />
            <TextField
              id="time"
              type="time"
              value={this.state.time}
              onChange={event => this.handleChange('time', event)}
            />
            <span>から</span>
            <TextField
              id="hour"
              type="number"
              value={this.state.hour}
              style={{width: 30}}
              onChange={event => this.handleChange('hour', event)}
            />
            <span>時間</span>
          </div>
          <div className="searchForm-buttons">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className="SearchForm-button"
            >
              <FontAwesomeIcon icon="search" size="lg" />
              検索する
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

export default SearchForm;