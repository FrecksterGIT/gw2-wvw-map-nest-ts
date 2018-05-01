import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import {timetools} from '../utils/timetools';

const logger = log('Objective');

export default class Objective extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();
    this.id = this.getAttribute('data-id');
    this.initElements();
    this.initInfoUpdates();
    this.initCopyChatCode();
  }

  static get observedAttributes() {
    return ['data-owner', 'data-last-flipped'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'data-last-flipped':
        this.initTurnedTimer(newValue);
        break;
    }
  }

  initElements() {
    this.turnedTimerElement = this.querySelector('aside');
    this.infoElement = this.querySelector('section');
    this.yakCounterElement = this.querySelector('.yaks.value');
    this.guildInfoElement = this.querySelector('.guild.value');
    this.heldInfoElement = this.querySelector('.turned.value');
    this.claimedInfoElement = this.querySelector('.claimed.value');
  }

  initInfoUpdates() {
    this.addEventListener('mouseover', () => {
      this.startInfoTimers();
    });
    this.addEventListener('mouseout', () => {
      this.stopInfoTimers();
    });
  }

  initCopyChatCode() {
    this.addEventListener('click', () => {
      this.copyChatCode();
    });
  }

  copyChatCode() {
    const input = document.createElement('input');
    input.style.opacity = '0';
    input.value = this.getAttribute('data-chat-link');
    this.appendChild(input);
    input.select();
    document.execCommand('Copy');
    this.removeChild(input);
  }

  handleObjectiveUpdate(data) {
    const receivedData = data.payload.find((objective) => objective.id === this.id);
    if (receivedData) {
      this.dataOwner = receivedData.owner;
      this.dataTier = Objective.calculateTier(receivedData.yaks_delivered);
      this.dataIsClaimed = !!receivedData.claimed_by;
      this.dataLastFlipped = receivedData.last_flipped;
      this.dataClaimedAt = receivedData.claimed_at;
      this.yakCounterElement.innerHTML = Objective.getDolyaksOutput(receivedData.yaks_delivered);
      if (receivedData.claimed_by) {
        this.guildInfoElement.innerHTML = receivedData.guild.name + ' [' + receivedData.guild.tag + ']';
        this.infoElement.style.backgroundImage =
          'url(http://wvw.sentientart.net/guild/' + receivedData.claimed_by + '.png)';
      }
      else {
        this.infoElement.style.backgroundImage = '';
      }
    }
  }

  static calculateTier(yaks = 0) {
    if (yaks >= 140) {
      return 3;
    }
    if (yaks >= 60) {
      return 2;
    }
    if (yaks >= 20) {
      return 1;
    }
    return 0;
  }

  static getDolyaksOutput(yaks = 0) {
    if (yaks < 20) {
      return yaks + '/ 20';
    }
    if (yaks <= 60) {
      return (yaks - 20) + ' / 40';
    }
    if (yaks < 140) {
      return (yaks - 60) + ' / 80';
    }
    return '';
  }

  initTurnedTimer(lastFlipped) {
    let timeSinceFlipped = timetools.diffTime(lastFlipped);
    if (timeSinceFlipped < timetools.COUNTDOWN_TIME) {
      this.turnedTimer = setInterval(() => {
        this.updateTurnedTimer();
      }, 1000);
      this.updateTurnedTimer();
    }
    else {
      clearInterval(this.turnedTimer);
      this.updateTurnedTimer();
    }
  }

  updateTurnedTimer() {
    let timeSinceFlipped = timetools.diffTime(this.dataLastFlipped);
    if (timeSinceFlipped < timetools.COUNTDOWN_TIME) {
      this.turnedTimerElement.innerHTML = timetools.getCountdown(this.dataLastFlipped);
      this.dataNewTurn = 'true';
    }
    else {
      this.turnedTimerElement.innerHTML = '';
      this.dataNewTurn = 'false';
    }
  }

  startInfoTimers() {
    this.infoTimer = setInterval(() => {
      this.updateInfoTimers();
    }, 1000);
    this.updateInfoTimers();
  }

  stopInfoTimers() {
    clearInterval(this.infoTimer);
  }

  updateInfoTimers() {
    this.heldInfoElement.innerHTML = timetools.getPassedTime(this.dataLastFlipped);
    this.claimedInfoElement.innerHTML = timetools.getPassedTime(this.dataClaimedAt);
  }

  set dataNewTurn(newTurn) {
    this.setAttributeIfChanged('data-new-turn', newTurn);
  }

  get dataNewTurn() {
    return this.getAttribute('data-new-turn');
  }

  set dataOwner(owner) {
    this.setAttributeIfChanged('data-owner', owner);
  }

  get dataOwner() {
    return this.getAttribute('data-owner');
  }

  set dataTier(tier) {
    this.setAttributeIfChanged('data-tier', tier);
  }

  get dataTier() {
    return this.getAttribute('data-tier');
  }

  set dataIsClaimed(isClaimed) {
    this.setAttributeIfChanged('data-is-claimed', isClaimed);
  }

  get dataIsClaimed() {
    return this.getAttribute('data-is-claimed');
  }

  set dataLastFlipped(lastFlipped) {
    this.setAttributeIfChanged('data-last-flipped', lastFlipped);
  }

  get dataLastFlipped() {
    return this.getAttribute('data-last-flipped');
  }

  set dataClaimedAt(claimedAt) {
    this.setAttributeIfChanged('data-claimed-at', claimedAt);
  }

  get dataClaimedAt() {
    return this.getAttribute('data-claimed-at');
  }

  setAttributeIfChanged(attribute, value) {
    if (this.getAttribute(attribute) !== value) {
      this.setAttribute(attribute, value);
    }
  }
}
