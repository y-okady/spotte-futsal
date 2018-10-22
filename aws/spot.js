const VLCMCrawler = require('./crawler').VLCMCrawler

class Spot {
  constructor(spot, crawlerClass, ...crawlerParams) {
    this.spot = spot;
    this.crawler = new crawlerClass(spot, ...crawlerParams);
  }
}

module.exports.SPOTS = [
  new Spot('キャプテン翼スタジアム新大阪', VLCMCrawler, '00148'),
  new Spot('キャプテン翼スタジアム天王寺', VLCMCrawler, '00172'),
  new Spot('もりのみやキューズモールフットサルコート', VLCMCrawler, '00169', true),
];