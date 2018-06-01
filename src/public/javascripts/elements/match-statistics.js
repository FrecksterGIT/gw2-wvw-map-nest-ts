import log from 'debug';
import Handlebars from 'handlebars';
import UpdateReceiverElement from './update-receiver-element';

const i18n = require('i18n-for-browser');
const logger = log('MatchStatistics');

export default class MatchStatistics extends UpdateReceiverElement {
  connectedCallback() {
    super.connectedCallback();

    const statsTemplate = this.querySelector('#stats-template').innerHTML;
    this.statsFunction = Handlebars.compile(statsTemplate);

    this.skirmishes = this.querySelector('.skirmishes');
    this.kd = this.querySelector('.kd');
    this.handleOpenClose();
  }

  handleOpenClose() {
    this.addEventListener('click', () => {
      this.setAttribute('data-open', this.getAttribute('data-open') === 'false' ? 'true' : 'false');
    });
  }

  handleSubscribeUpdate(data) {
    this.skirmishes.innerHTML = '';
    data.payload.skirmishes.pop();
    data.payload.skirmishes.reverse();
    data.payload.skirmishes.forEach((skirmish) => this.renderSkirmish(skirmish));
  }

  handleScoreUpdate(data) {
    this.kd.innerHTML = '';
    this.renderKd(data.payload);
  }

  renderSkirmish(skirmish) {
    const data = MatchStatistics.getTemplateData(skirmish.scores, i18n.__('Skirmish') + ' ' + skirmish.id);
    const content = this.statsFunction(data);
    this.skirmishes.insertAdjacentHTML('beforeend', content);
  }

  renderKd(payload) {
    const kills = MatchStatistics.getTemplateData(payload.kills, i18n.__('Kills'));
    const killsContent = this.statsFunction(kills);
    this.kd.insertAdjacentHTML('beforeend', killsContent);

    const deaths = MatchStatistics.getTemplateData(payload.deaths, i18n.__('Deaths'));
    const deathsContent = this.statsFunction(deaths);
    this.kd.insertAdjacentHTML('beforeend', deathsContent);

    const ratios = {
      blue: (payload.kills.blue / payload.deaths.blue).toFixed(2),
      green: (payload.kills.green / payload.deaths.green).toFixed(2),
      red: (payload.kills.red / payload.deaths.red).toFixed(2)
    };
    const kdRatios = MatchStatistics.getTemplateData(ratios, i18n.__('K/D'));
    const kdRatiosContent = this.statsFunction(kdRatios);
    this.kd.insertAdjacentHTML('beforeend', kdRatiosContent);
  }

  static getTemplateData(values, header) {
    const max = Math.max(...Object.values(values));
    const scores = {
      blue: {score: values.blue, percent: (values.blue / max * 100) + '%'},
      green: {score: values.green, percent: (values.green / max * 100) + '%'},
      red: {score: values.red, percent: (values.red / max * 100) + '%'}
    };
    return {
      header,
      scores
    };
  }

}
