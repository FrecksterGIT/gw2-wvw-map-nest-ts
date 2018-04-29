import 'babel-polyfill';
import MatchSelector from './elements/match-selector';
import Objective from './elements/objective';
import MatchStatus from './elements/match-status';

import log from 'debug';

log.enable('MatchSelector, MatchStatus, Socket');

window.customElements.define('gw2-match-selector', MatchSelector);
window.customElements.define('gw2-match-status', MatchStatus);
window.customElements.define('gw2-objective', Objective);
