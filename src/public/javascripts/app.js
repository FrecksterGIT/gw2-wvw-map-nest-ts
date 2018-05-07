import '@babel/polyfill';
import '@webcomponents/custom-elements';
import MatchSelector from './elements/match-selector';
import Objective from './elements/objective';
import MatchStatus from './elements/match-status';
import MatchLogger from './elements/match-logger';
import log from 'debug';
import {SocketConnection} from './utils/socket';
import Handlebars from 'handlebars';

const i18n = require('i18n-for-browser');

const locales = {
  de: require('../locales/de'),
  en: require('../locales/en'),
  es: require('../locales/es'),
  fr: require('../locales/fr')
};

i18n.configure({
  defaultLocale: 'en',
  directory: '../locales',
  locales: locales
});

i18n.setLocale(SocketConnection.getLanguage());

Handlebars.registerHelper('t', i18n.__);

log.enable('MatchSelector, MatchStatus, MatchLogger, Objective, Socket');

window.customElements.define('gw2-match-selector', MatchSelector);
window.customElements.define('gw2-match-status', MatchStatus);
window.customElements.define('gw2-match-logger', MatchLogger);
window.customElements.define('gw2-objective', Objective);
