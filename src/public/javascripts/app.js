import 'babel-polyfill';
import '@webcomponents/custom-elements';
import MatchSelector from './elements/match-selector';
import Objective from './elements/objective';
import MatchStatus from './elements/match-status';
import MatchLogger from './elements/match-logger';

import log from 'debug';

log.enable('MatchSelector, MatchStatus, MatchLogger, Objective, Socket');

window.customElements.define('gw2-match-selector', MatchSelector);
window.customElements.define('gw2-match-status', MatchStatus);
window.customElements.define('gw2-match-logger', MatchLogger);
window.customElements.define('gw2-objective', Objective);
