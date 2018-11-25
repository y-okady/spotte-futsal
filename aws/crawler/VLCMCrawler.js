const dateformat = require('dateformat');
const { Crawler } = require('./Crawler');

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