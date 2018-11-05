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
  new Spot(
    'FUT MESSE 海老江',
    'http://www.fut-messe.com/ebie/',
    VLCMCrawler, '00175'
  ),
  new Spot(
    'FUT MESSE 大正',
    'http://www.fut-messe.com/taisho/',
    VLCMCrawler, '00053'
  ),
  new Spot(
    'FUT MESSE 鶴見緑地',
    'http://www.fut-messe.com/tsurumi/',
    VLCMCrawler, '00162'
  ),
  new Spot(
    'FUT MESSE 生野',
    'http://www.fut-messe.com/ikuno/',
    VLCMCrawler, '00065'
  ),
  new Spot(
    'マグフットサルスミノエ',
    'http://futsal.mags.co.jp/',
    VLCMCrawler, '00052'
  ),
  new Spot(
    'マグフットサルスタジアム',
    'http://futsal.mags.co.jp/',
    VLCMCrawler, '00051'
  ),
  new Spot(
    'クーバー・フットボールパーク 大阪平野',
    'http://www.coerver-footballpark.com/osaka-hirano/',
    VLCMCrawler, '00007'
  ),
];

const SPOTS_MAP = Object.assign(...SPOTS.map(spot => ({[spot.spot]: spot})));

module.exports.SPOTS = SPOTS;
module.exports.SPOTS_MAP = SPOTS_MAP;