const dateformat = require('dateformat');

class Searcher {
  constructor(elasticsearchClient) {
    this.elasticsearchClient = elasticsearchClient;
  }

  async search(begin, end, lat, lon) {
    return this.elasticsearchClient.search({
      index: 'futsal',
      type: 'courts',
      body: {
        query: {
          bool: {
            must: [
              {
                'geo_distance': {
                  'distance': '100km',
                  'location': {
                    lat: lat,
                    lon: lon
                  }
                }
              },
              {
                nested: {
                  path: 'vacancies',
                  query: {
                    bool: {
                      must: [
                        {
                          range: {
                            'vacancies.begin': {
                              to: dateformat(begin, 'isoDateTime')
                            }
                          }
                        },
                        {
                          range: {
                            'vacancies.end': {
                              from: dateformat(end, 'isoDateTime')
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            ]
          }
        },
        size: 30,
        collapse: {
          field: 'spot',
          inner_hits: {
            name: 'courts',
            size: 10,
            sort: ['order']
          }
        },
        sort: [
          {
            '_geo_distance': {
              'location': {
                lat: lat,
                lon: lon
              }
            }
          }
        ]
      }
    });
  }
}

module.exports = { Searcher };