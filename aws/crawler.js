const dateformat = require('dateformat');
dateformat.masks.dateHourMinuteSecond = 'yyyy-mm-dd"\'T\'"HH:MM:ss';

class Crawler {
  constructor(spot) {
    this.spot = spot;
    this.courts = [];
    this.savedCourts = new Set();
    this.savedDates = new Set();
  }

  getUrls() {
    throw new Error('Not implemented.');
  }

  async parse(page) {
    throw new Error('Not implemented.');
  }

  async crawl(browser, elasticsearchClient) {
    await Promise.all(this.getUrls().map(async url => await this.crawlOne(browser, url))).then(() => {
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
      console.log(`delete all documents of "${this.spot}"`)
      this.courts.forEach(court => {
        elasticsearchClient.index({
          index: 'futsal',
          type: 'courts',
          body: {
            spot: this.spot,
            date: dateformat(court.date, 'yyyy-mm-dd'),
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
      console.log(`add ${this.courts.length} documents of "${this.spot}"`);
    });
  }

  async crawlOne(browser, url) {
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 10000,
    }).catch(error => {
      // エラーが出ても無視する
      console.log(`failed to load ${url}.`)
    });
    for (let court of await this.parse(page)) {
      this.courts.push(court);
      this.savedCourts.add(court.name);
      this.savedDates.add(court.date.getTime());
    }
    await page.close();
  }

  static getDateFromMonthAndDay(month, day) {
    const now = new Date();
    const year = month - 1 >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1;
    return new Date(year, month - 1, day);
  }

  static createCourt(name, order, date) {
    return new Court(name, order, date);
  }

  isSavedDate(date) {
    return this.savedDates.has(date.getTime());
  }

  static isTargetDate(date) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()) <= date
      && date < new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60);
  }

  isValidDate(date) {
    return !this.isSavedDate(date) && Crawler.isTargetDate(date);
  }

  static async getText(el) {
    return (await el.getProperty('textContent')).jsonValue()
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
  constructor(spot, cid, isMonth) {
    super(spot);
    this.cid = cid;
    this.isMonth = Boolean(isMonth);
  }

  getUrls() {
    // 月表示の場合、今日から1ヶ月、4週間後から1ヶ月、8週間後(56日後)から1ヶ月の3画面をチェックする
    // 週表示の場合、今日から1週間、1週間後から1週間、...、8週間後(56日後) から1週間の9画面をチェックする
    const weeksInterval = this.isMonth ? 4 : 1;
    const rangeMax = this.isMonth ? 3 : 9;
    return [...Array(rangeMax).keys()].map(x => {
      let date = new Date();
      date.setDate(date.getDate() + x * weeksInterval * 7);
      return `http://www.vlcm.net/rc/pc/index.php?action_CRA01_01do=true&cid=${this.cid}&executeType=selectDate&selectDate=${dateformat(date, 'yyyymmdd')}`;
    });
  }

  async parse(page) {
    let courts = [];
    for (const table of await page.$$(('.yoyaku'))) {
      const rows = await table.$$('tr');
      const headerCells = await rows[0].$$('th');
      const dateStr = await Crawler.getText(headerCells[0]);
      const date = Crawler.getDateFromMonthAndDay(Number(dateStr.substr(0, 2)), Number(dateStr.substr(3, 2)));
      if (!this.isValidDate(date)) {
        continue;
      }

      const times = await Promise.all(headerCells.slice(1, -1).map(async cell => await Crawler.getText(cell)));
      const timeSpan = Number(times[1].substr(3, 2)) - Number(times[0].substr(3, 2)) == 0 ? 1 : 0.5;
      for (let i = 1; i < rows.length; i++) {
        const cells = await rows[i].$$('td');
        const name = await Crawler.getText(cells[0]);
        let court = Crawler.createCourt(name, i, date);
        let pos = 0;
        for (const cell of cells.slice(1, -1)) {
          const colspan = Number(await (await page.evaluateHandle(el => {
            return el.getAttribute('colspan');
          }, cell)).jsonValue()) || 1;
          let className = await (await cell.getProperty('className')).jsonValue();
          if (className.split(' ').includes('class_empty')) {
            // 空き時間セル
            let begin = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
              Number(times[pos].substr(0, 2)), Number(times[pos].substr(3, 2)));
              court.addVacancy(begin, new Date(begin.getFullYear(), begin.getMonth(), begin.getDate(), begin.getHours() + timeSpan * colspan, begin.getMinutes()));
          }
          pos += colspan;
        }
        courts.push(court);
      }
    }
    return courts;
  }
}

module.exports.VLCMCrawler = VLCMCrawler;