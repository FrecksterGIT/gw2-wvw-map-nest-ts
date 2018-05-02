import log from 'debug';

const logger = log('Chart');

export default class Chart {
  constructor(svg, slices = []) {
    this.animationTime = 500;
    this.svg = svg;
    this.slices = slices;
    this.pathElements = [];
    this.diffs = [];
    this.draw();
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
    const [startX, startY] = Chart.getCoordinatesForPercent(startPercent);
    const endPercent = startPercent + slice.percent;
    const [endX, endY] = Chart.getCoordinatesForPercent(endPercent);
    const largeArcFlag = slice.percent > .5 ? 1 : 0;
    return `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
  }

  static getPathElement(slice, startPercent) {
    const path = Chart.getSlicePath(slice, startPercent);
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', path);
    pathElement.setAttribute('fill', slice.color);
    pathElement.style.stroke = '#fff';
    pathElement.style.strokeWidth = '0.05';
    return pathElement;
  }

  draw() {
    let cumulativePercent = 0;
    this.slices.forEach(slice => {
      const pathEl = Chart.getPathElement(slice, cumulativePercent);
      cumulativePercent += slice.percent;
      this.svg.appendChild(pathEl);
      this.pathElements.push(pathEl);
    });
  }

  update(slices) {
    this.startTime = 0;
    this.calculateDiffs(slices);
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
      const [currentStart, currentEnd] = this.getCurrentValues(diff, elapsedTime);
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

  getCurrentValues(diff, elapsedTime) {
    const currentStart = (elapsedTime < this.animationTime)
      ? Chart.calculateAnimationValue(elapsedTime, diff.startFrom, diff.startTo - diff.startFrom, this.animationTime)
      : diff.startTo;
    const currentEnd = (elapsedTime < this.animationTime)
      ? Chart.calculateAnimationValue(elapsedTime, diff.endFrom, diff.endTo - diff.endFrom, this.animationTime)
      : diff.endTo;
    return [currentStart, currentEnd];
  }

  calculateDiffs(slices) {
    this.diffs = [];
    let nextFromStart = 0;
    let nextToStart = 0;
    this.slices.forEach((slice, index) => {
      [nextFromStart, nextToStart] = this.makeDiff(slice, slices[index], nextFromStart, nextToStart);
    });
  }

  makeDiff(oldSlice, newSlice, nextFromStart, nextToStart) {
    this.diffs.push({
      endFrom: oldSlice.percent + nextFromStart,
      endTo: newSlice.percent + nextToStart,
      startFrom: nextFromStart,
      startTo: nextToStart
    });
    return [nextFromStart + oldSlice.percent, nextToStart + newSlice.percent];
  }

  isAnimationNeeded() {
    const different = this.diffs.find((diff) => diff.startFrom !== diff.startTo || diff.endFrom !== diff.endTo);
    return !!different;
  }
}
