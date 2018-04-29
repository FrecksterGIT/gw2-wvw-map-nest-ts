import 'babel-polyfill';
import MatchSelector from './elements/match-selector';
import Objective from './elements/objective';

import log from 'debug';

log.enable('MatchSelector, Socket, Objective');

window.customElements.define('gw2-match-selector', MatchSelector);
window.customElements.define('gw2-objective', Objective);
