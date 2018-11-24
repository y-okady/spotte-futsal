const { ToDoCrawler, UnsupportedCrawler } = require('../aws/crawler/Crawler');
const { SPOTS } = require('../aws/spot');

console.log(`All: ${SPOTS.length}`);
console.log(`Supported: ${SPOTS.filter(spot => !(spot.crawler instanceof ToDoCrawler || spot.crawler instanceof UnsupportedCrawler)).length}`);
console.log(`Unsupported: ${SPOTS.filter(spot => spot.crawler instanceof UnsupportedCrawler).length}`);
console.log(`ToDo: ${SPOTS.filter(spot => spot.crawler instanceof ToDoCrawler).length}`);

SPOTS.filter(spot => spot.crawler instanceof ToDoCrawler)
  .forEach(spot => console.log(spot.spot, spot.url));