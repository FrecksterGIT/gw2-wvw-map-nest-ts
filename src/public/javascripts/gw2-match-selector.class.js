import socket from './socket';
import log from 'debug';
import delegate from 'delegate';

const logger = log('Gw2MatchSelector');

export default class Gw2MatchSelector extends HTMLElement {

  connectedCallback() {
    const redPoints = this.querySelector('.red.points');
    const bluePoints = this.querySelector('.blue.points');
    const greenPoints = this.querySelector('.green.points');
    socket.on('subscribed', (data) => {
      logger('match selector subscribed for updates', data);
      this.querySelectorAll('.match').forEach((match) => {
        match.classList.remove('selected');
      });
      this.querySelector('.match[data-match-id="' + data + '"]').classList.add('selected');
    });
    socket.on('update', (data) => {
      if (data.type === 1) {
        redPoints.innerHTML = data.payload.red;
        bluePoints.innerHTML = data.payload.blue;
        greenPoints.innerHTML = data.payload.green;
      }
    });
    this.initSwitchMatchHandler();
  }

  initSwitchMatchHandler() {
    delegate(this, '.match', 'click', (event) => {
      const matchId = event.delegateTarget.closest('.match').getAttribute('data-match-id');
      socket.emit('subscribe', matchId);
    });
  }
}
