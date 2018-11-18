const dateformat = require('dateformat');

class Crawler {
  constructor(spot, lat, lon) {
    this.spot = spot;
    this.lat = lat;
    this.lon = lon;
    this.courts = [];
  }

  getUrl(date) {
    throw new Error('Not implemented.');
  }

  getUrls() {
    throw new Error('Not implemented.');
  }

  async parse(page) {
    throw new Error('Not implemented.');
  }

  async crawl(browser, elasticsearchClient) {
    console.log(`start crawling: ${this.spot}`);
    const begin = new Date().getTime();
    await Promise.all(this.getUrls().map(url => this.crawlOne(browser, url))).then(() => {
      elasticsearchClient.deleteByQuery({
        index: 'futsal',
        type: 'courts',
        body: {
          query: {
            match: {
              spot: this.spot
            }
          }
        }
      });
      this.courts.forEach(court => {
        elasticsearchClient.index({
          index: 'futsal',
          type: 'courts',
          body: {
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
          }
        })
      });
      const end = Math.floor((new Date().getTime() - begin) / 1000);
      console.log(`${end} seconds, ${this.courts.length} documents`);
    });
  }

  async crawlOne(browser, url) {
    return browser.newPage()
      .then(page => {
        return page.goto(url, {timeout: 30000, waitUntil: 'networkidle0'})
          .catch(error => console.log(`failed to load ${url}.`)) // エラーが出ても無視する
          .then(resp => page);
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
      && date < new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60);
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