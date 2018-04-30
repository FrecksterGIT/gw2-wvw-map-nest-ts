import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Handlebars from 'handlebars';

const logger = log('MatchStatus');

export default class MatchStatus extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();

    const worldsTemplate = this.querySelector('#worlds-template').innerHTML;
    this.worldsFunction = Handlebars.compile(worldsTemplate);

    const numbersTemplate = this.querySelector('#numbers-template').innerHTML;
    this.numbersFunction = Handlebars.compile(numbersTemplate);
  }

  handleSubscribeUpdate(data) {
    this.handleScoreUpdate(data);
    this.renderWorldsTemplates(data);
  }

  handleScoreUpdate(data) {
    const scores = {
      header: 'Points',
      values: data.payload.scores
    };

    const income = {
      header: 'Income',
      values: data.payload.income
    };
    const victoryPoints = {
      header: 'Victory Points',
      values: data.payload.victoryPoints
    };

    this.querySelector('.scores').innerHTML = this.numbersFunction(scores);
    this.querySelector('.income').innerHTML = this.numbersFunction(income);
    this.querySelector('.victory_points').innerHTML = this.numbersFunction(victoryPoints);
  }

  renderWorldsTemplates(data) {
    this.querySelector('.worlds').outerHTML = this.worldsFunction(data.payload);
  }
}
