import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Handlebars from 'handlebars';

import {__} from 'i18n-for-browser';
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
  }

  handleSubscribeUpdate(data) {
    this.handleScoreUpdate(data);
    this.renderWorldsTemplates(data);
  }

  handleScoreUpdate(data) {
    const scores = {
      header: __('Points'),
      values: data.payload.scores
    };
    const income = {
      header: __('Income'),
      values: data.payload.income
    };
    const victoryPoints = {
      diffs: MatchStatus.getDiffs(data.payload.victoryPoints),
      header: __('Victory Points'),
      values: data.payload.victoryPoints
    };

    this.querySelector('.scores').innerHTML = this.numbersFunction(scores);
    this.querySelector('.income').innerHTML = this.numbersFunction(income);
    this.querySelector('.victory_points').innerHTML = this.victoryPointsFunction(victoryPoints);
  }

  static getDiffs(numbers) {
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
