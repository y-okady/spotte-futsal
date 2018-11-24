const dateformat = require('dateformat');
const { Crawler } = require('./Crawler');

class FCJapanCrawler extends Crawler {
  constructor(spot, lat, lon, faciId) {
    super(spot, lat, lon);
    this.faciId = faciId;
  }

  getUrl(date) {
    return `https://yoyaku.fcjapan.jp/team/scripts/user/faci_schedule.php?faci_id=${this.faciId}&date=${dateformat(date, 'yyyy-mm-dd')}`;
  }

  getUrls() {
    return [...Array(10).keys()].map(x => {
      let date = new Date();
      date.setDate(date.getDate() + x * 7);
      return this.getUrl(date);
    });
  }

  async parse(page) {
    return page.evaluate(() => {
      const now = new Date();
      const courts = [];
      Array.from(window.document.querySelectorAll('.calendar table tbody')).slice(1).forEach(tbody => { // eslint-disable-line no-undef
        let date = null;
        Array.from(tbody.querySelectorAll('tr')).forEach((row, order) => {
          const dateCell = row.querySelector('th.time.date.strong');
          let courtCell = null;
          if (dateCell) {
            const month = Number(dateCell.textContent.split('/')[0]);
            const day = Number(dateCell.textContent.split('/')[1].slice(0, -1));
            const year = month >= now.getMonth() + 1 ? now.getFullYear() : now.getFullYear() + 1;
            date = new Date(year, month - 1, day);
            courtCell = dateCell.nextElementSibling;
          } else {
            courtCell = row.querySelector('th');
          }
          if (!date) {
            return;
          }
          courts.push({
            name: courtCell.textContent,
            order: order,
            date: date.getTime(),
            vacancies: Array.from(row.querySelectorAll('a[href^="faci_signup.php"]')).map(el => {
              const params = new URLSearchParams(el.search);
              let begin = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                Number(params.get('start_time').split(':')[0]), Number(params.get('start_time').split(':')[1]));
              let end = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                Number(params.get('end_time').split(':')[0]), Number(params.get('end_time').split(':')[1]));
              return {begin: begin.getTime(), end: end.getTime()};
            })
          });
        });
      });
      return courts;
    });
  }
}

module.exports = { FCJapanCrawler };