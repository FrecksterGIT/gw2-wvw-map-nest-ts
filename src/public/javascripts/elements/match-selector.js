import socket from '../utils/socket';
import log from 'debug';
import delegate from 'delegate';
import UpdateReceiverElement from './update-receiver-element';

const logger = log('MatchSelector');

export default class MatchSelector extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();
    socket.on('subscribed', (data) => {
      this.handleMatchSwitcher(data);
    });
    this.initSwitchMatchHandler();
  }

  initSwitchMatchHandler() {
    delegate(this, '.match', 'click', (event) => {
      const matchId = event.delegateTarget.getAttribute('data-match-id');
      socket.emit('subscribe', matchId);
    });
  }

  handleMatchSwitcher(data) {
    logger('match selector subscribed for updates', data);
    this.querySelectorAll('.match').forEach((match) => {
      match.classList.remove('selected');
    });
    this.querySelector('.match[data-match-id="' + data + '"]').classList.add('selected');
  }

  handleScoreUpdate(data) {
    const redPoints = this.querySelector('.red.points');
    const bluePoints = this.querySelector('.blue.points');
    const greenPoints = this.querySelector('.green.points');
    redPoints.innerHTML = data.payload.red;
    bluePoints.innerHTML = data.payload.blue;
    greenPoints.innerHTML = data.payload.green;
  }

}
