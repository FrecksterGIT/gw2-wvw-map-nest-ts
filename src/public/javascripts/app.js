import '@babel/polyfill';
import '@webcomponents/custom-elements';
import Handlebars from 'handlebars';
import log from 'debug';

import BarChart from './elements/bar-chart';
import MatchStatistics from './elements/match-statistics';
import MatchLogger from './elements/match-logger';
import MatchSelector from './elements/match-selector';
import MatchStatus from './elements/match-status';
import Objective from './elements/objective';
import PieChart from './elements/pie-chart';
import World from './elements/world';

const i18n = require('i18n-for-browser');

const locales = {
  de: require('../locales/de'),
  en: require('../locales/en'),
  es: require('../locales/es'),
  fr: require('../locales/fr')
};

const getLanguage = () => {
  const path = window.location.pathname;
  const match = /([a-z]{2})/.exec(path);
  return match && match[1] ? match[1] : 'en';
};

i18n.configure({
  defaultLocale: 'en',
  directory: '../locales',
  locales: locales
});

i18n.setLocale(getLanguage());

Handlebars.registerHelper('t', i18n.__);

log.enable('MatchStatistics, MatchSelector, MatchStatus, MatchLogger, Objective, Socket, World, Chart, BarChart, PieChart');

window.customElements.define('gw2-world', World);
window.customElements.define('gw2-match-statistics', MatchStatistics);
window.customElements.define('gw2-match-selector', MatchSelector);
window.customElements.define('gw2-match-status', MatchStatus);
window.customElements.define('gw2-match-logger', MatchLogger);
window.customElements.define('gw2-objective', Objective);
window.customElements.define('gw2-bar-chart', BarChart);
window.customElements.define('gw2-pie-chart', PieChart);

export {getLanguage};
