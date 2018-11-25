const dateformat = require('dateformat');

class Crawler {
  constructor(spot, lat, lon) {
    this.spot = spot;
    this.lat = lat;
    this.lon = lon;
    this.courts = new Map();
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
    return Promise.all(this.getUrls().map(url => this.crawlOne(browser, url))).then(async () => {
      await this._deleteAllCourts(elasticsearchClient);
      await this._indexCourts(elasticsearchClient);
      const seconds = Math.floor((new Date().getTime() - begin) / 1000);
      console.log(`${seconds} seconds, ${this.courts.size} courts`);
    });
  }

  async crawlOne(browser, url) {
    const page = await browser.newPage();
    await page.goto(url, {timeout: 30000, waitUntil: 'load'});
    for (const court of await this.parse(page)) {
      if (!this.courts.has(court.name)) {
        this.courts.set(court.name, new Court(court.name, court.order));
      }
      let savedVacancies = new Set();
      court.vacancies
        .filter(vacancy => Crawler.isTargetDate(new Date(vacancy.begin)))
        .filter(vacancy => !savedVacancies.has(vacancy.begin))
        .forEach(vacancy => {
          savedVacancies.add(vacancy.begin);
          this.courts.get(court.name).addVacancy(new Date(vacancy.begin), new Date(vacancy.end));
        });
    }
    await page.close();
  }

  static isTargetDate(date) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()) <= date
      && date < new Date(now.getFullYear(), now.getMonth(), now.getDate() + Crawler.TARGET_DAYS);
  }
}

class ToDoCrawler extends Crawler {
  async crawl(browser, elasticsearchClient) { // eslint-disable-line no-unused-vars
    console.log(`ToDo: ${this.spot}`);
  }
}

class UnsupportedCrawler extends Crawler {
  async crawl(browser, elasticsearchClient) { // eslint-disable-line no-unused-vars
    console.log(`not supported: ${this.spot}`);
  }
}

class Court {
  constructor(name, order) {
    this.name = name;
    this.order = order;
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

Crawler.TARGET_DAYS = 60;
module.exports = { Crawler, ToDoCrawler, UnsupportedCrawler };