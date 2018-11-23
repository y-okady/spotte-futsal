const dateformat = require('dateformat');
const TARGET_DAYS = 60;

class Crawler {
  constructor(spot, lat, lon) {
    this.spot = spot;
    this.lat = lat;
    this.lon = lon;
    this.courts = [];
  }

  getUrl(date) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented.');
  }

  getUrls() {
    throw new Error('Not implemented.');
  }

  async parse(page) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented.');
  }

  async _deleteAllCourts(elasticsearchClient) {
    return elasticsearchClient.deleteByQuery({
      index: 'futsal',
      type: 'courts',
      body: {
        query: {
          match: {
            spot: this.spot
          }
        }
      }
    }).catch(error => console.log(error));
  }

  async _indexCourts(elasticsearchClient) {
    const body = [];
    this.courts.forEach(court => {
      body.push({
        index: {
          _index: 'futsal',
          _type: 'courts',
        }
      },
      {
        spot: this.spot,
        date: dateformat(court.date, 'yyyy-mm-dd'),
        location: {
          lat: this.lat,
          lon: this.lon
        },
        court: court.name,
        order: court.order,
        vacancies: court.vacancies.map(vacancy => {
          return {
            begin: dateformat(vacancy.begin, 'isoDateTime'),
            end: dateformat(vacancy.end, 'isoDateTime'),
          };
        }),
      });
    });
    return elasticsearchClient.bulk({
      body: body,
    }).catch(error => console.log(error));
  }

  async crawl(browser, elasticsearchClient) {
    console.log(`start crawling: ${this.spot}`);
    const begin = new Date().getTime();
    return Promise.all(this.getUrls().map(url => this.crawlOne(browser, url)))
      .then(() => this._deleteAllCourts(elasticsearchClient))
      .then(() => this._indexCourts(elasticsearchClient))
      .then(() => {
        const seconds = Math.floor((new Date().getTime() - begin) / 1000);
        console.log(`${seconds} seconds, ${this.courts.length} documents`);
      });
  }

  async crawlOne(browser, url) {
    return browser.newPage()
      .then(page => {
        return page.goto(url, {timeout: 30000, waitUntil: 'networkidle0'})
          .catch(() => console.log(`failed to load ${url}.`)) // エラーが出ても無視する
          .then(() => page);
      })
      .then(page => {
        return this.parse(page).then(items => {
          page.close();
          return items;
        });
      })
      .then(items => {
        items.forEach(item => {
          const date = new Date(item.date);
          if (!Crawler.isTargetDate(date)) {
            return;
          }
          let court = new Court(item.name, item.order, date);
          for (const vacancy of item.vacancies) {
            court.addVacancy(new Date(vacancy.begin), new Date(vacancy.end));
          }
          this.courts.push(court);
        });
      });
  }

  static isTargetDate(date) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()) <= date
      && date < new Date(now.getFullYear(), now.getMonth(), now.getDate() + TARGET_DAYS);
  }
}

class Court {
  constructor(name, order, date) {
    this.name = name;
    this.order = order;
    this.date = date;
    this.vacancies = [];
  }

  addVacancy(begin, end) {
    if (this.vacancies.length > 0 && begin.getTime() == this.vacancies[this.vacancies.length - 1].end.getTime()) {
      this.vacancies[this.vacancies.length - 1].end = end;
    } else {
      this.vacancies.push(new Vacancy(begin, end));
    }
  }
}

class Vacancy {
  constructor(begin, end) {
    this.begin = begin;
    this.end = end;
  }
}

module.exports = { Crawler };