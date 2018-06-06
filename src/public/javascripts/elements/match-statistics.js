import log from 'debug';
import Handlebars from 'handlebars';
import UpdateReceiverElement from './update-receiver-element';
import Hourly from '../utils/hourly';

const i18n = require('i18n-for-browser');
const logger = log('MatchStatistics');

export default class MatchStatistics extends UpdateReceiverElement {
  connectedCallback() {
    super.connectedCallback();

    const statsTemplate = this.querySelector('#stats-template').innerHTML;
    this.statsFunction = Handlebars.compile(statsTemplate);

    this.skirmishes = this.querySelector('.skirmishes');
    this.kd = this.querySelector('.kd');
    this.distribution = this.querySelector('.distribution');
    this.hourly = this.querySelector('.hourly');
    this.hourly2 = this.querySelector('.hourly2');
    this.skirmishessvg = this.querySelector('.skirmishessvg');
  }

  handleSubscribeUpdate(data) {
    this.renderSkrimishes(data.payload.skirmishes);
    this.renderDistribution(data.payload);
    this.renderHourly(data.payload);
  }

  handleScoreUpdate(data) {
    this.kd.innerHTML = '';
    this.renderKd(data.payload);
  }

  renderDistribution(payload) {
    this.distribution.innerHTML = '';
    this.getDistribution(payload.skirmishes, payload.main_worlds).forEach((teamData) => {
      const content = this.statsFunction(teamData);
      this.distribution.insertAdjacentHTML('beforeend', content);
    });
  }

  renderHourly(payload) {
    const skirmishes = payload.skirmishes.map(skirmish => skirmish);
    skirmishes.pop();

    this.hourly.innerHTML = '';
    const svgPerTeamHourly = Hourly.getSvgPerTeam(skirmishes, payload.startTime);
    this.hourly.insertAdjacentHTML('beforeend', svgPerTeamHourly);

    this.hourly2.innerHTML = '';
    const svgMaxHourly = Hourly.getSvgOverall(skirmishes, payload.startTime);
    this.hourly2.insertAdjacentHTML('beforeend', svgMaxHourly);

    this.skirmishessvg.innerHTML = '';
    const svgSkirmishes = Hourly.getSvgSkirmishes(skirmishes);
    this.skirmishessvg.insertAdjacentHTML('beforeend', svgSkirmishes);
  }

  renderSkrimishes(skirmishes) {
    this.skirmishes.innerHTML = '';
    const sk = skirmishes.map(skirmish => skirmish);
    sk.pop();
    sk.reverse();
    sk.forEach((skirmish) => this.renderSkirmish(skirmish));
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

  static getTemplateData(values, header, colored = true) {
    const max = Math.max(...Object.values(values));
    const scores = {
      blue: {score: values.blue, percent: (values.blue / max * 100) + '%'},
      green: {score: values.green, percent: (values.green / max * 100) + '%'},
      red: {score: values.red, percent: (values.red / max * 100) + '%'}
    };
    return {
      colored,
      header,
      scores
    };
  }

  getDistribution(skirmishes, worlds) {
    const data = skirmishes.reduce((stats, skirmish) => {
      const min = Math.min(...Object.values(skirmish.scores));
      const max = Math.max(...Object.values(skirmish.scores));
      switch (true) {
        case (skirmish.scores.blue === max):
          stats.blue[1]++;
          break;
        case (skirmish.scores.blue === min):
          stats.blue[3]++;
          break;
        default:
          stats.blue[2]++;
      }
      switch (true) {
        case (skirmish.scores.green === max):
          stats.green[1]++;
          break;
        case (skirmish.scores.green === min):
          stats.green[3]++;
          break;
        default:
          stats.green[2]++;
      }
      switch (true) {
        case (skirmish.scores.red === max):
          stats.red[1]++;
          break;
        case (skirmish.scores.red === min):
          stats.red[3]++;
          break;
        default:
          stats.red[2]++;
      }
      return stats;
    }, {
      blue: {
        '1': 0,
        '2': 0,
        '3': 0
      },
      green: {
        '1': 0,
        '2': 0,
        '3': 0
      },
      red: {
        '1': 0,
        '2': 0,
        '3': 0
      }
    });

    const blueData = MatchStatistics.getTemplateData({
      blue: data.blue[2],
      green: data.blue[1],
      red: data.blue[3]
    }, worlds.blue, false);

    const redData = MatchStatistics.getTemplateData({
      blue: data.red[2],
      green: data.red[1],
      red: data.red[3]
    }, worlds.red, false);

    const greenData = MatchStatistics.getTemplateData({
      blue: data.green[2],
      green: data.green[1],
      red: data.green[3]
    }, worlds.green, false);
    return [greenData, blueData, redData];
  }

}
