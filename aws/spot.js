const VLCMCrawler = require('./crawler').VLCMCrawler

class Spot {
  constructor(spot, lat, lon, url, crawlerClass, ...crawlerParams) {
    this.spot = spot;
    this.url = url;
    this.crawler = new crawlerClass(spot, lat, lon, ...crawlerParams);
  }
}

const SPOTS = [
  new Spot(
    'キャプテン翼スタジアム新大阪', 34.733047, 135.497118,
    'https://tsubasa-stadium.com/shin-osaka/',
    VLCMCrawler, '00148'
  ),
  new Spot(
    'キャプテン翼スタジアム天王寺', 34.648261, 135.511066,
    'https://tsubasa-stadium.com/tennoji/',
    VLCMCrawler, '00172'
  ),
  new Spot(
    'もりのみやキューズモールフットサルコート', 34.68044, 135.530252,
    'http://www.sportsoasis.co.jp/sh18/futsal/',
    VLCMCrawler, '00169', true
  ),
  new Spot(
    'FUT MESSE 海老江', 34.698211, 135.467765,
    'http://www.fut-messe.com/ebie/',
    VLCMCrawler, '00175'
  ),
  new Spot(
    'FUT MESSE 大正', 34.653792, 135.477069,
    'http://www.fut-messe.com/taisho/',
    VLCMCrawler, '00053'
  ),
  new Spot(
    'FUT MESSE 鶴見緑地', 34.708274, 135.580273,
    'http://www.fut-messe.com/tsurumi/',
    VLCMCrawler, '00162'
  ),
  new Spot(
    'FUT MESSE 生野', 34.652424, 135.557184,
    'http://www.fut-messe.com/ikuno/',
    VLCMCrawler, '00065'
  ),
  new Spot(
    'マグフットサルスミノエ', 34.610705, 135.468701,
    'http://futsal.mags.co.jp/',
    VLCMCrawler, '00052'
  ),
  new Spot(
    'マグフットサルスタジアム', 34.610705, 135.468701,
    'http://futsal.mags.co.jp/',
    VLCMCrawler, '00051'
  ),
  new Spot(
    'クーバー・フットボールパーク 大阪平野', 34.608301, 135.566148,
    'http://www.coerver-footballpark.com/osaka-hirano/',
    VLCMCrawler, '00007'
  ),
];

const SPOTS_MAP = Object.assign(...SPOTS.map(spot => ({[spot.spot]: spot})));

module.exports.SPOTS = SPOTS;
module.exports.SPOTS_MAP = SPOTS_MAP;