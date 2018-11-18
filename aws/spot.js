const { VLCMCrawler } = require('./crawler/VLCMCrawler');

class Spot {
  constructor(spot, lat, lon, url, crawlerClass, ...crawlerParams) {
    this.spot = spot;
    this.url = url;
    this.crawler = new crawlerClass(spot, lat, lon, ...crawlerParams);
  }
}

const SPOTS = [
  // 大阪府
  new Spot('キャプテン翼スタジアム新大阪', 34.733047, 135.497118, 'https://tsubasa-stadium.com/shin-osaka/', VLCMCrawler, '00148'),
  new Spot('キャプテン翼スタジアム天王寺', 34.648261, 135.511066,　'https://tsubasa-stadium.com/tennoji/', VLCMCrawler, '00172'),
  new Spot('もりのみやキューズモールフットサルコート', 34.68044, 135.530252, 'http://www.sportsoasis.co.jp/sh18/futsal/', VLCMCrawler, '00169', true),
  new Spot('FUT MESSE 海老江', 34.698211, 135.467765, 'http://www.fut-messe.com/ebie/', VLCMCrawler, '00175'),
  new Spot('FUT MESSE 大正', 34.653792, 135.477069, 'http://www.fut-messe.com/taisho/', VLCMCrawler, '00053'),
  new Spot('FUT MESSE 鶴見緑地', 34.708274, 135.580273, 'http://www.fut-messe.com/tsurumi/', VLCMCrawler, '00162'),
  new Spot('FUT MESSE 生野', 34.652424, 135.557184, 'http://www.fut-messe.com/ikuno/', VLCMCrawler, '00065'),
  new Spot('マグフットサルスミノエ', 34.610705, 135.468701, 'http://futsal.mags.co.jp/', VLCMCrawler, '00052'),
  new Spot('マグフットサルスタジアム', 34.610705, 135.468701, 'http://futsal.mags.co.jp/', VLCMCrawler, '00051'),
  new Spot('クーバー・フットボールパーク 大阪平野', 34.608301, 135.566148, 'http://www.coerver-footballpark.com/osaka-hirano/', VLCMCrawler, '00007'),
  // 東京都
  new Spot('キャプテン翼スタジアム東京北', 35.75314, 139.738896, 'https://tsubasa-stadium.com/tokyo-kita/', VLCMCrawler, '00144'),
  // 神奈川県
  new Spot('キャプテン翼スタジアム横浜元町', 35.438154, 139.661427, 'https://tsubasa-stadium.com/yokohama-motomachi/', VLCMCrawler, '00161'),
  // 埼玉県
  new Spot('キャプテン翼スタジアム南与野', 35.862866, 139.63181, 'https://tsubasa-stadium.com/minamiyono/', VLCMCrawler, '00190'),
  new Spot('キャプテン翼スタジアム戸田', 35.814316, 139.663346, 'https://tsubasa-stadium.com/toda/', VLCMCrawler, '00189'),
  new Spot('キャプテン翼スタジアム南浦和', 35.846409, 139.667467, 'https://tsubasa-stadium.com/minamiurawa/', VLCMCrawler, '00188'),
  // 岐阜県
  new Spot('キャプテン翼スタジアム垂井', 35.374834, 136.533438, 'https://tsubasa-stadium.com/tarui/access', VLCMCrawler, '00216'),
];

const SPOTS_MAP = Object.assign(...SPOTS.map(spot => ({[spot.spot]: spot})));

module.exports = { SPOTS, SPOTS_MAP };