import socket from '../utils/socket';
import log from 'debug';
import Cookie from 'js-cookie';
import delegate from 'delegate';
import UpdateReceiverElement from './update-receiver-element';

const logger = log('MatchSelector');

export default class MatchSelector extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();
    this.initSwitchMatchHandler();
    this.initCloseOnClickOutside();
    this.initOpenerElements();
  }

  initSwitchMatchHandler() {
    delegate(this, '.match-selector-match', 'click', (event) => {
      const matchId = event.delegateTarget.getAttribute('data-match-id');
      this.setAttribute('data-selected-match', matchId);
      socket.emit('subscribe', matchId);
      this.showShader = true;
    });
  }

  handleSubscribeUpdate(data) {
    logger('match selector subscribed for updates', data.id);
    const matchId = data.id;
    Cookie.set('match', matchId, {expires: 31});
    this.handleMatchSwitcher(matchId);
    this.receivedSubscribeUpdateFor = matchId;
    this.isLoadingDone();
  }

  handleObjectiveUpdate(data) {
    this.receivedObjectiveUpdateFor = data.id;
    this.isLoadingDone();
  }

  isLoadingDone() {
    const matchId = this.getAttribute('data-selected-match');
    if ((this.receivedObjectiveUpdateFor === matchId)
      && (this.receivedSubscribeUpdateFor === matchId)) {
      this.showShader = false;
    }
  }

  handleMatchSwitcher(matchId) {
    this.querySelectorAll('.match-selector-match').forEach((match) => {
      match.classList.remove('selected');
    });
    this.querySelector('.match-selector-match[data-match-id="' + matchId + '"]').classList.add('selected');
    this.isOpen = false;
  }

  initOpenerElements() {
    delegate('body', '[data-open-match-selector="true"]', 'click', () => {
      this.isOpen = true;
    });
  }

  initCloseOnClickOutside() {
    document.querySelector('body').addEventListener('click', (event) => {
      if (!this.contains(event.target) && !event.target.closest('[data-open-match-selector="true"]')) {
        this.isOpen = false;
      }
    });
  }

  get isOpen() {
    return this.getAttribute('data-open') === 'true';
  }

  set isOpen(isOpen) {
    this.setAttribute('data-open', isOpen);
  }

  set showShader(show) {
    this.setAttribute('data-shader', show);
  }
}
