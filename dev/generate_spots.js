const axios = require('axios');
const fs = require('fs');
const path = require('path');

const LAST_CELL = 'H32';
axios.get(`https://sheets.googleapis.com/v4/spreadsheets/1sBX5Vv-GIs9u4YYsRGHFW5jm-htex98i3CpT6J0ti9s/values/A1:${LAST_CELL}?key=AIzaSyAxXvINR16iBrOrLnoGXxHhdkbz7CPyk9U`)
  .then(resp => resp.data.values.map(row => ({
    spot: row[1],
    lat: Number(row[2]),
    lon: Number(row[3]),
    url: row[4],
    crawlerClass: row[5],
    args: row.slice(6)
  })))
  .then(spots => {
    fs.writeFileSync(path.join(__dirname, '..', 'aws', 'spots.json'), JSON.stringify(spots));
  });