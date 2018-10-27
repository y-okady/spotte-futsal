const dateformat = require('dateformat');

class Searcher {
  constructor(elasticsearchClient) {
    this.elasticsearchClient = elasticsearchClient;
  }

  async search(begin, end) {
    return this.elasticsearchClient.search({
      index: 'futsal',
      type: 'courts',
      body: {
        query: {
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
        },
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
            spot: 'asc'
          }
        ]
      }
    });
  }
}

module.exports.Searcher = Searcher;