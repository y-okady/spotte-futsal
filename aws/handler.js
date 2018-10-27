const launchChrome = require('@serverless-chrome/lambda');
const CDP = require('chrome-remote-interface');
const puppeteer = require('puppeteer');
const SPOTS = require('./spot').SPOTS;
const elasticsearch = require('elasticsearch');
const Searcher = require('./searcher').Searcher;

const createElasticsearchClient = () => {
  return new elasticsearch.Client({
    host: {
      protocol: 'https',
      host: process.env['ES_HOST'],
      port: 9243,
      auth: `${process.env['ES_USER']}:${process.env['ES_PASS']}`,
    },
    log: 'info',
  });
}

module.exports.crawl = async (event, context, callback) => {
  await launchChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: (await CDP.Version()).webSocketDebuggerUrl
  });
  const elasticsearchClient = createElasticsearchClient();
  for (let spot of SPOTS) {
    await spot.crawler.crawl(browser, elasticsearchClient);
  }
  await browser.close();
};

module.exports.search = async (event, context, callback) => {
  console.log('request: ' + JSON.stringify(event));
  const params = event.queryStringParameters;
  ['year', 'month', 'day', 'hours', 'minutes', 'hour'].forEach(key => {
    if (!params.hasOwnProperty(key)) {
      throw new Error(`missing parameter: ${key}`);
    }
  });
  const begin = new Date(params.year, params.month - 1, params.day, params.hours, params.minutes);
  const end = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate(), begin.getHours() + params.hour, begin.getMinutes());
  new Searcher(createElasticsearchClient()).search(begin, end)
    .then(resp => {
      console.log(resp);
    })
    .catch(err => {
      console.error(err);
    });
};