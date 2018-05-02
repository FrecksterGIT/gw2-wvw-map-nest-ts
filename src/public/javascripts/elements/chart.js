import log from 'debug';

const logger = log('Chart');

export default class Chart {
  constructor(svg, slices = []) {
    this.svg = svg;
    this.slices = slices;
    this.pathElements = [];
    this.animationTime = 500;
    this.diffs = [];
    this.circle();
  }

  static getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);

    return [x, y];
  }

  static calculateAnimationValue(t, b, c, d) {
    return c * (-Math.pow(2, -10 * t / d) + 1) + b;
  }

  static getSlicePath(slice, startPercent) {
    // destructuring assignment sets the two variables at once
    const [startX, startY] = Chart.getCoordinatesForPercent(startPercent);

    // each slice starts where the last slice ended, so keep a cumulative percent
    const endPercent = startPercent + slice.percent;

    const [endX, endY] = Chart.getCoordinatesForPercent(endPercent);

    // if the slice is more than 50%, take the large arc (the long way around)
    const largeArcFlag = slice.percent > .5 ? 1 : 0;

    const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

    // create a <path> and append it to the <svg> element
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', pathData);
    pathEl.setAttribute('fill', slice.color);
    pathEl.style.stroke = '#fff';
    pathEl.style.strokeWidth = '0.05';

    return pathEl;
  }

  circle() {
    let cumulativePercent = 0;
    this.slices.forEach(slice => {
      const pathEl = Chart.getSlicePath(slice, cumulativePercent);
      cumulativePercent += slice.percent;
      this.svg.appendChild(pathEl);
      this.pathElements.push(pathEl);
    });
  }

  update(slices) {
    this.startTime = 0;
    this.diffs = this.calculateDiffs(slices);
    if (this.isAnimationNeeded()) {
      logger('redraw chart...');
      this.step();
      this.slices = slices;
    }
  }

  step(timestamp = 0) {
    this.startTime = this.startTime ? this.startTime : timestamp;
    const elapsedTime = timestamp - this.startTime;
    this.diffs.forEach((diff, index) => {
      const currentStart = (elapsedTime < this.animationTime)
        ? Chart.calculateAnimationValue(elapsedTime, diff.startFrom, diff.startTo - diff.startFrom, this.animationTime)
        : diff.startTo;
      const currentEnd = (elapsedTime < this.animationTime)
        ? Chart.calculateAnimationValue(elapsedTime, diff.endFrom, diff.endTo - diff.endFrom, this.animationTime)
        : diff.endTo;
      const [startX, startY] = Chart.getCoordinatesForPercent(currentStart);
      const [endX, endY] = Chart.getCoordinatesForPercent(currentEnd);
      const largeArcFlag = currentEnd - currentStart > .5 ? 1 : 0;
      const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
      this.pathElements[index].setAttribute('d', pathData);
    });
    if (elapsedTime < this.animationTime) {
      window.requestAnimationFrame(this.step.bind(this));
    }
  }

  calculateDiffs(slices) {
    const move = [];
    let nextFromStart = 0;
    let nextToStart = 0;
    this.slices.forEach((slice, index) => {
      move.push({
        endFrom: slice.percent + nextFromStart,
        endTo: slices[index].percent + nextToStart,
        startFrom: nextFromStart,
        startTo: nextToStart
      });
      nextFromStart += slice.percent;
      nextToStart += slices[index].percent;
    });
    return move;
  }

  isAnimationNeeded() {
    const different = this.diffs.find((diff) => diff.startFrom !== diff.startTo || diff.endFrom !== diff.endTo);
    return !!different;
  }
}
