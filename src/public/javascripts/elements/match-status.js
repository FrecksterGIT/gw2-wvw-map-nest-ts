import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Handlebars from 'handlebars';
import Chart from '../utils/chart';

const i18n = require('i18n-for-browser');
const logger = log('MatchStatus');

export default class MatchStatus extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();

    const worldsTemplate = this.querySelector('#worlds-template').innerHTML;
    this.worldsFunction = Handlebars.compile(worldsTemplate);

    const numbersTemplate = this.querySelector('#numbers-template').innerHTML;
    this.numbersFunction = Handlebars.compile(numbersTemplate);

    const victoryPointsTemplate = this.querySelector('#victory-points-template').innerHTML;
    this.victoryPointsFunction = Handlebars.compile(victoryPointsTemplate);

    const chartElement = this.querySelector('#chart');
    this.chart = new Chart(chartElement, [
      {color: '#1e7b2d', percent: 0},
      {color: '#1a4da1', percent: 0},
      {color: '#b02822', percent: 0}
    ]);
  }

  handleSubscribeUpdate(data) {
    this.handleScoreUpdate(data, false);
    this.renderWorldsTemplates(data);
  }

  handleScoreUpdate(data, updateChart = true) {
    const scores = {
      header: i18n.__('Points'),
      values: data.payload.scores
    };

    const income = {
      header: i18n.__('Income'),
      values: data.payload.income
    };
    const victoryPoints = {
      diffs: this.getDiffs(data.payload.victoryPoints),
      header: i18n.__('Victory Points'),
      values: data.payload.victoryPoints
    };
    this.querySelector('.scores').innerHTML = this.numbersFunction(scores);
    this.querySelector('.income').innerHTML = this.numbersFunction(income);
    this.querySelector('.victory_points').innerHTML = this.victoryPointsFunction(victoryPoints);

    if (updateChart) {
      const sum = data.payload.income.red + data.payload.income.blue + data.payload.income.green;
      this.chart.update([
        {percent: data.payload.income.green / sum},
        {percent: data.payload.income.blue / sum},
        {percent: data.payload.income.red / sum}
      ]);
    }
  }

  getDiffs(numbers) {
    const max = Math.max(...Object.values(numbers));
    return {
      blue: numbers.blue - max,
      green: numbers.green - max,
      red: numbers.red - max
    };

  }

  renderWorldsTemplates(data) {
    this.querySelector('.worlds').outerHTML = this.worldsFunction(data.payload);
  }
}
