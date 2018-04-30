import socket from '../utils/socket';
import log from 'debug';
import Cookie from 'js-cookie';
import delegate from 'delegate';

const logger = log('MatchSelector');

export default class MatchSelector extends HTMLElement {

  connectedCallback() {
    socket.on('subscribed', (data) => {
      Cookie.set('match', data, { expires: 31 });
      this.handleMatchSwitcher(data);
    });
    this.initSwitchMatchHandler();
  }

  initSwitchMatchHandler() {
    delegate(this, '.match-selector-match', 'click', (event) => {
      const matchId = event.delegateTarget.getAttribute('data-match-id');
      socket.emit('subscribe', matchId);
    });
  }

  handleMatchSwitcher(data) {
    logger('match selector subscribed for updates', data);
    this.querySelectorAll('.match-selector-match').forEach((match) => {
      match.classList.remove('selected');
    });
    this.querySelector('.match-selector-match[data-match-id="' + data + '"]').classList.add('selected');
    this.setAttribute('data-open', 'false');
  }
}
