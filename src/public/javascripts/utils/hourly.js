import log from 'debug';

const logger = log('MatchStatistics');

export default class Hourly {

  static getSvgPerTeam(skirmishes, startTime) {
    const hourly = Hourly.prepareData(skirmishes, startTime);
    const greenPath = Hourly.getPath(hourly.green, Math.max(...Object.values(hourly.green)));
    const bluePath = Hourly.getPath(hourly.blue, Math.max(...Object.values(hourly.blue)));
    const redPath = Hourly.getPath(hourly.red, Math.max(...Object.values(hourly.red)));
    const legend = Hourly.createLegend();
    return Hourly.makeSvg(greenPath, bluePath, redPath, legend);
  }

  static getSvgOverall(skirmishes, startTime) {
    const hourly = Hourly.prepareData(skirmishes, startTime);
    const max = Math.max(
      Math.max(...Object.values(hourly.green)),
      Math.max(...Object.values(hourly.blue)),
      Math.max(...Object.values(hourly.red))
    );
    const greenPath = Hourly.getPath(hourly.green, max);
    const bluePath = Hourly.getPath(hourly.blue, max);
    const redPath = Hourly.getPath(hourly.red, max);
    const legend = Hourly.createLegend();
    return Hourly.makeSvg(greenPath, bluePath, redPath, legend);
  }

  static prepareData(skirmishes, startTime) {
    const startHour = new Date(startTime).getHours();
    return skirmishes.reduce((acc, skirmish) => {
      const hour = (startHour + (2 * (skirmish.id - 1))) % 24;
      ['green', 'blue', 'red'].forEach((color) => {
        if (!acc[color][hour]) {
          acc[color][hour] = 0;
        }
        acc[color][hour] += skirmish.scores[color];
      });
      return acc;
    }, {blue: {}, green: {}, red: {}});
  }

  static makeSvg(greenPath, bluePath, redPath, legend) {
    return `<svg viewBox="0 0 220 100" preserveAspectRatio="none"
                 xmlns="http://www.w3.org/2000/svg">
              <rect x="0%" y="0%" width="100%" height="100" fill="none" />
              <path stroke="#1e7b2d" stroke-width="2" fill="none" d="${greenPath}"></path>
              <path stroke="#1a4da1" stroke-width="2" fill="none" d="${bluePath}"></path>
              <path stroke="#b02822" stroke-width="2" fill="none" d="${redPath}"></path>
            </svg>${legend}`;
  }

  static getPath(hourly, max) {
    return Object.entries(hourly).reduce((path, hour) => {
      if (path === '') {
        return 'M0 ' + (100 - Math.floor(hour[1] / max * 100));
      }
      const x = (hour[0] * 10);
      return path + ' L' + x + ' ' + (100 - Math.floor(hour[1] / max * 100));
    }, '');
  }

  static createLegend() {
    return '<div class="legend">' + [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].reduce((result, hour) => {
      return `${result}<div>${hour}</div>`;
    }, '') + '</div>';
  }
}
