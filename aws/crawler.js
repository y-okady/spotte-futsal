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
          let court = Crawler.createCourt(item.name, item.order, date);
          for (const vacancy of item.vacancies) {
            court.addVacancy(new Date(vacancy.begin), new Date(vacancy.end));
          }
          this.courts.push(court);
        });
      });
  }

  static createCourt(name, order, date) {
    return new Court(name, order, date);
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

class VLCMCrawler extends Crawler {
  constructor(spot, lat, lon, cid, isMonth) {
    super(spot, lat, lon);
    this.cid = cid;
    this.isMonth = Boolean(isMonth);
  }

  getUrl(date) {
    return `http://www.vlcm.net/rc/pc/index.php?action_CRA01_01do=true&cid=${this.cid}&executeType=selectDate&selectDate=${dateformat(date, 'yyyymmdd')}`;
  }

  getUrls() {
    // 月表示の場合、今日から1ヶ月、4週間後から1ヶ月、8週間後(56日後)から1ヶ月の3画面をチェックする
    // 週表示の場合、今日から1週間、1週間後から1週間、...、8週間後(56日後) から1週間の9画面をチェックする
    const weeksInterval = this.isMonth ? 4 : 1;
    const rangeMax = this.isMonth ? 3 : 9;
    return [...Array(rangeMax).keys()].map(x => {
      let date = new Date();
      date.setDate(date.getDate() + x * weeksInterval * 7);
      return this.getUrl(date);
    });
  }

  async parse(page) {
    const now = new Date();
    return page.evaluate(() => {
      const courts = [];
      Array.from(document.querySelectorAll('.yoyaku')).forEach(table => {
        const rows = Array.from(table.querySelectorAll('tr'));
        const headerCells = Array.from(rows[0].querySelectorAll('th'));

        const dateStr = headerCells[0].textContent;
        const month = Number(dateStr.substr(0, 2));
        const day = Number(dateStr.substr(3, 2));
        const year = month - 1 >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1;
        const date = new Date(year, month - 1, day);

        const times = headerCells.slice(1, -1).map(cell => cell.textContent);
        const timeSpan = Number(times[1].substr(3, 2)) - Number(times[0].substr(3, 2)) == 0 ? 1 : 0.5;

        let order = 0;
        for (const row of rows.slice(1)) {
          const cells = Array.from(row.querySelectorAll('td'));
          let pos = 0;
          const vacancies = [];
          for (const cell of cells.slice(1, -1)) {
            const colspan = Number(cell.getAttribute('colspan') || 1);
            if (cell.classList.contains('class_empty')) {
              // 空き時間セル
              let begin = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                Number(times[pos].substr(0, 2)), Number(times[pos].substr(3, 2)));
              let end = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate(),
                begin.getHours() + timeSpan * colspan, begin.getMinutes());
              vacancies.push({begin: begin.getTime(), end: end.getTime()});
            }
            pos += colspan;
          }
          courts.push({name: cells[0].textContent, order: order++, date: date.getTime(), vacancies: vacancies});
        }
      });
      return courts;
    });
  }
}

module.exports.VLCMCrawler = VLCMCrawler;