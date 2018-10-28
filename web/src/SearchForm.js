import React, { Component } from 'react';
import { TextField, Button } from '@material-ui/core';

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
        <form onSubmit={event => this.handleSubmit(event)}>
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
          から
          <TextField
            id="hour"
            type="number"
            value={this.state.hour}
            onChange={event => this.handleChange('hour', event)}
          />
          時間
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            検索
          </Button>
        </form>
      </div>
    );
  }
}

export default SearchForm;