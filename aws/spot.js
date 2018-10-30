const VLCMCrawler = require('./crawler').VLCMCrawler

class Spot {
  constructor(spot, url, crawlerClass, ...crawlerParams) {
    this.spot = spot;
    this.url = url;
    this.crawler = new crawlerClass(spot, ...crawlerParams);
  }
}

const SPOTS = [
  new Spot(
    'キャプテン翼スタジアム新大阪',
    'https://tsubasa-stadium.com/shin-osaka/',
    VLCMCrawler, '00148'
  ),
  new Spot(
    'キャプテン翼スタジアム天王寺',
    'https://tsubasa-stadium.com/tennoji/',
    VLCMCrawler, '00172'
  ),
  new Spot(
    'もりのみやキューズモールフットサルコート',
    'http://www.sportsoasis.co.jp/sh18/futsal/',
    VLCMCrawler, '00169', true
  ),
];

const SPOTS_MAP = Object.assign(...SPOTS.map(spot => ({[spot.spot]: spot})));

module.exports.SPOTS = SPOTS;
module.exports.SPOTS_MAP = SPOTS_MAP;