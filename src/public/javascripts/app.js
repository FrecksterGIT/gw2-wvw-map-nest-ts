import socket from './socket';
import Gw2MatchSelector from './gw2-match-selector.class';

import log from 'debug';

log.enable('Gw2MatchSelector, Socket');

window.customElements.define('gw2-match-selector', Gw2MatchSelector);
