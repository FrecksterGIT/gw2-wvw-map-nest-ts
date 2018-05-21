import Chart from './chart';

let chart;

describe('Chart', () => {
  beforeEach(() => {
    const svg = {
      appendChild: () => {
        // noop
      }
    };

    const startPaths = [
      {percent: 30, color: 'red'},
      {percent: 30, color: 'blue'},
      {percent: 30, color: 'green'}
    ];
    chart = new Chart(svg, startPaths);
    chart.gapPercent = 0;
  });

  it('should get the correct values for percentage', () => {
    expect(Chart.getCoordinatesForPercent(1)).toEqual([Math.cos(2 * Math.PI), Math.sin(2 * Math.PI)]);
    expect(Chart.getCoordinatesForPercent(.5)).toEqual([Math.cos(Math.PI), Math.sin(Math.PI)]);
  });

  it('should calculate diffs correctly', () => {
    const newPaths = [{percent: 40}, {percent: 50}, {percent: 10}];
    chart.calculateDiffs(newPaths);
    expect(chart.diffs).toEqual([
      {
        endFrom: 30,
        endTo: 40,
        startFrom: 0,
        startTo: 0
      },
      {
        endFrom: 60,
        endTo: 90,
        startFrom: 30,
        startTo: 40
      },
      {
        endFrom: 90,
        endTo: 100,
        startFrom: 60,
        startTo: 90
      }
    ]);
  });
  it('should start an animation when needed', () => {
    expect(chart.isAnimationNeeded()).toBe(false);
    const newPaths = [{percent: 40}, {percent: 50}, {percent: 10}];
    chart.calculateDiffs(newPaths);
    expect(chart.isAnimationNeeded()).toBe(true);
  });
});
