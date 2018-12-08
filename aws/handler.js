const launchChrome = require('@serverless-chrome/lambda');
const CDP = require('chrome-remote-interface');
const puppeteer = require('puppeteer');
const elasticsearch = require('elasticsearch');
const { SPOTS, SPOTS_MAP } = require('./spot');
const { Searcher } = require('./Searcher');

const createElasticsearchClient = () => {
  return new elasticsearch.Client({
    host: {
      protocol: process.env['ES_PROTOCOL'],
      host: process.env['ES_HOST'],
      port: Number(process.env['ES_PORT']),
      auth: process.env['ES_USER'] ? `${process.env['ES_USER']}:${process.env['ES_PASS']}`: null,
    },
    log: 'info',
  });
};

module.exports.crawl = async (event, context, callback) => { // eslint-disable-line no-unused-vars
  const offset = event.hasOwnProperty('offset') ? Number(event.offset) : 500;
  const limit = event.hasOwnProperty('limit') ? Number(event.limit) : 0;
  await launchChrome({
    flags: ['--headless']
  });
  const browser = await puppeteer.connect({
    browserWSEndpoint: (await CDP.Version()).webSocketDebuggerUrl
  });
  console.log('start');
  const begin = new Date().getTime();
  for (let spot of SPOTS.slice(offset, offset + limit)) {
    await spot.crawler.crawl(browser, createElasticsearchClient());
  }
  await browser.close();
  const seconds = Math.floor((new Date().getTime() - begin) / 1000);
  console.log(`end: ${seconds} seconds`);
};

module.exports.search = async (event, context, callback) => {
  const params = event.queryStringParameters;
  ['date', 'time', 'hour', 'lat', 'lon'].forEach(key => {
    if (!params.hasOwnProperty(key)) {
      throw new Error(`missing parameter: ${key}`);
    }
  });
  const begin = new Date(`${params.date} ${params.time}`);
  const end = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate(), begin.getHours() + Number(params.hour), begin.getMinutes());
  const lat = Number(params.lat);
  const lon = Number(params.lon);
  await new Searcher(createElasticsearchClient()).search(begin, end, lat, lon)
    .then(resp => {
      const hits = resp.hits.hits.map(spot => {
        const spotName = spot._source.spot;
        return {
          spot: spotName,
          courts: spot.inner_hits.courts.hits.hits.map(court => {
            return court._source.court;
          }),
          url: SPOTS_MAP[spotName].url,
          bookingUrl: SPOTS_MAP[spotName].crawler.getUrl(begin),
        };
      });
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(hits),
      });
    })
    .catch(err => {
      console.log(err.message);
      callback(null, {
        statusCode: 400,
        body: err.message
      });
    });
};

module.exports.deleteDocuments = async (event, context, callback) => { // eslint-disable-line no-unused-vars
  await createElasticsearchClient().deleteByQuery({
    index: 'futsal',
    type: 'courts',
    body: {
      query: {
        match_all: {}
      }
    }
  })
    .then(() => console.log('delete documents'));
};

module.exports.initIndex = async (event, context, callback) => { // eslint-disable-line no-unused-vars
  const elasticsearchClient = createElasticsearchClient();
  await elasticsearchClient.indices.delete({
    index: 'futsal'
  }).then(() => elasticsearchClient.indices.create({
    index: 'futsal',
    body: {
      mappings: {
        courts: {
          properties: {
            spot: {
              type: 'keyword'
            },
            location: {
              type: 'geo_point'
            },
            vacancies: {
              type: 'nested',
              properties: {
                begin: {
                  type: 'date',
                  format: 'date_optional_time'
                },
                end: {
                  type: 'date',
                  format: 'date_optional_time'
                }
              }
            }
          }
        }
      }
    }
  }));
};