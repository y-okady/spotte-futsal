const fs = require('fs');
const path = require('path');
const { VLCMCrawler } = require('./crawler/VLCMCrawler'); // eslint-disable-line no-unused-vars

class Spot {
  constructor(spot, url, crawler) {
    this.spot = spot;
    this.url = url;
    this.crawler = crawler;
  }
}

const SPOTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'spots.json'))).map(item =>
  new Spot(item.spot, item.url, new (eval(item.crawlerClass))(item.spot, item.lat, item.lon, ...item.args)));
const SPOTS_MAP = Object.assign(...SPOTS.map(spot => ({[spot.spot]: spot})));

module.exports = { SPOTS, SPOTS_MAP };