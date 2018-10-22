const launchChrome = require('@serverless-chrome/lambda');
const CDP = require('chrome-remote-interface');
const puppeteer = require('puppeteer');
const SPOTS = require('./spot').SPOTS;
const elasticsearch = require('elasticsearch');

module.exports.crawl = async (event, context, callback) => {
  await launchChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: (await CDP.Version()).webSocketDebuggerUrl
  });
  const elasticsearchClient = new elasticsearch.Client({
    host: {
      protocol: 'https',
      host: process.env['ES_HOST'],
      port: 9243,
      auth: `${process.env['ES_USER']}:${process.env['ES_PASS']}`,
    },
    log: 'info',
  });
  for (let spot of SPOTS) {
    await spot.crawler.crawl(browser, elasticsearchClient);
  }
  await browser.close();
};