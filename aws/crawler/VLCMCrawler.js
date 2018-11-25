const dateformat = require('dateformat');
const { Crawler } = require('./Crawler');

class VLCMCrawler extends Crawler {
  constructor(spot, lat, lon, cid, weeksPerPage) {
    super(spot, lat, lon);
    this.cid = cid;
    this.weeksPerPage = weeksPerPage ? Number(weeksPerPage) : 1;
  }

  getUrl(date) {
    return `http://www.vlcm.net/rc/pc/index.php?action_CRA01_01do=true&cid=${this.cid}&executeType=selectDate&selectDate=${dateformat(date, 'yyyymmdd')}`;
  }

  getUrls() {
    return [...Array(Math.ceil(Crawler.TARGET_DAYS / 7 / this.weeksPerPage)).keys()].map(x => {
      let date = new Date();
      date.setDate(date.getDate() + x * this.weeksPerPage * 7);
      return this.getUrl(date);
    });
  }

  async parse(page) {
    return page.evaluate(() => {
      const now = new Date();
      const courts = [];
      Array.from(window.document.querySelectorAll('.yoyaku')).forEach(table => { // eslint-disable-line no-undef
        const rows = Array.from(table.querySelectorAll('tr'));
        const headerCells = Array.from(rows[0].querySelectorAll('th'));

        const dateStr = headerCells[0].textContent;
        const month = Number(dateStr.substr(0, 2));
        const day = Number(dateStr.substr(3, 2));
        const year = month >= now.getMonth() + 1 ? now.getFullYear() : now.getFullYear() + 1;
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
          courts.push({
            name: cells[0].textContent,
            order: order++,
            vacancies: vacancies
          });
        }
      });
      return courts;
    });
  }
}

module.exports = { VLCMCrawler };