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

  static getSvgSkirmishes(skirmishes) {
    const points = {red: [], blue: [], green: []};
    const max = Math.max(...skirmishes.reduce((acc, skirmish) => {
      acc.push(skirmish.scores.red, skirmish.scores.blue, skirmish.scores.green);
      return acc;
    }, []));
    const widthPerSkirmish = 880 / (skirmishes.length - 1);
    skirmishes.forEach((skirmish, index) => {
      points.red.push([index * widthPerSkirmish, 120 - (skirmish.scores.red / max * 100)]);
      points.blue.push([index * widthPerSkirmish, 120 - (skirmish.scores.blue / max * 100)]);
      points.green.push([index * widthPerSkirmish, 120 - (skirmish.scores.green / max * 100)]);
    });

    let legendSk = `<div>1</div>`;
    if (skirmishes.length % 2 === 0) {
      const legendEntry = skirmishes.length / 4;
      skirmishes.forEach((skirmish) => {
        if (skirmish.id % legendEntry === 0) {
          legendSk += `<div>${skirmish.id}</div>`;
        }
      });
    } else {
      legendSk += `<div>${Math.floor(skirmishes.length / 2)}</div>`;
      legendSk += `<div>${skirmishes.length}</div>`;
    }
    const legend = '<div class="legend">' + legendSk + '</div>';

    const redPath = Hourly.makeBezier(points.red);
    const bluePath = Hourly.makeBezier(points.blue);
    const greenPath = Hourly.makeBezier(points.green);
    return Hourly.makeSvg(greenPath, bluePath, redPath, legend);
  }

  static makeSvg(greenPath, bluePath, redPath, legend, width = 880) {
    return `<svg viewBox="0 0 ${width} 120" preserveAspectRatio="none"
                 xmlns="http://www.w3.org/2000/svg">
              <rect x="0%" y="0%" width="100%" height="100" fill="none" />
              <path stroke="#1e7b2d" stroke-width="2" fill="none" d="${greenPath}"></path>
              <path stroke="#1a4da1" stroke-width="2" fill="none" d="${bluePath}"></path>
              <path stroke="#b02822" stroke-width="2" fill="none" d="${redPath}"></path>
            </svg>${legend}`;
  }

  static getPath(hourly, max) {
    const points = Object.entries(hourly).map((hour) => [hour[0] * 40, (120 - Math.floor(hour[1] / max * 100))]);
    return Hourly.makeBezier(points);
  }

  static makeBezier(points) {
    const x = points.map(point => point[0]);
    const y = points.map(point => point[1]);

    const px = Hourly.computeControlPoints(x);
    const py = Hourly.computeControlPoints(y);

    return points.reduce((acc, point, i) => {
      if (!y[i + 1]) {
        return acc;
      }
      return acc + ' M ' + x[i] + ' ' + y[i] + ' C ' + px.p1[i] + ' ' + py.p1[i] + ' '
        + px.p2[i] + ' ' + py.p2[i] + ' ' +
        x[i + 1] + ' ' + y[i + 1];
    }, '');
  }

  static computeControlPoints(K) {
    const p1 = [];
    const p2 = [];
    const n = K.length - 1;

    /*rhs vector*/
    const a = [];
    const b = [];
    const c = [];
    const r = [];

    /*left most segment*/
    a[0] = 0;
    b[0] = 2;
    c[0] = 1;
    r[0] = K[0] + 2 * K[1];

    /*internal segments*/
    for (let i = 1; i < n - 1; i++) {
      a[i] = 1;
      b[i] = 4;
      c[i] = 1;
      r[i] = 4 * K[i] + 2 * K[i + 1];
    }

    /*right segment*/
    a[n - 1] = 2;
    b[n - 1] = 7;
    c[n - 1] = 0;
    r[n - 1] = 8 * K[n - 1] + K[n];

    /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
    for (let i = 1; i < n; i++) {
      const m = a[i] / b[i - 1];
      b[i] = b[i] - m * c[i - 1];
      r[i] = r[i] - m * r[i - 1];
    }

    p1[n - 1] = r[n - 1] / b[n - 1];
    for (let i = n - 2; i >= 0; --i) {
      p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];
    }

    /*we have p1, now compute p2*/
    for (let i = 0; i < n - 1; i++) {
      p2[i] = 2 * K[i + 1] - p1[i + 1];
    }

    p2[n - 1] = 0.5 * (K[n] + p1[n - 1]);

    return {p1: p1, p2: p2};
  }

  static createLegend() {
    return '<div class="legend">' + [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].reduce((result, hour) => {
      return `${result}<div>${hour}</div>`;
    }, '') + '</div>';
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
}
