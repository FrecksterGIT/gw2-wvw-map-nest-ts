import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import {timetools} from '../utils/timetools';

const logger = log('Objective');

export default class Objective extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();
    this.initializeTimer();
    this.id = this.getAttribute('data-id');
  }

  static get observedAttributes() {
    return ['data-owner'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'data-owner':
        if (oldValue !== newValue) {
          logger(this.id, oldValue, newValue);
        }
        break;
    }
  }

  initializeTimer() {
    setInterval(() => {
      this.updateTimers();
    }, 1000);
  }

  handleObjectiveUpdate(data) {
    const receivedData = data.payload.find((objective) => objective.id === this.id);
    if (receivedData) {
      this.setAttribute('data-owner', receivedData.owner);
      this.setAttribute('data-tier', this.calculateTier(receivedData.yaks_delivered));
      this.setAttribute('data-is-claimed', !!receivedData.claimed_by);
      this.setAttribute('data-last-flipped', receivedData.last_flipped);
      this.setAttribute('data-claimed-at', receivedData.claimed_at);

      this.querySelector('.yaks.value').innerHTML = this.getDolyaksOutput(receivedData.yaks_delivered);
      if (receivedData.claimed_by) {
        this.querySelector('.guild.value').innerHTML = receivedData.guild.name + ' [' + receivedData.guild.tag + ']';
        this.querySelector('section').style.backgroundImage =
          'url(http://wvw.sentientart.net/guild/' + receivedData.claimed_by + '.png)';
      } else {
        this.querySelector('section').style.backgroundImage = '';
      }
    }
  }

  calculateTier(yaks = 0) {
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

  getDolyaksOutput(yaks = 0) {
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

  updateTimers() {
    const lastFlipped = this.getAttribute('data-last-flipped');
    const claimedAt = this.getAttribute('data-claimed-at');
    this.querySelector('.turned.value').innerHTML = timetools.getPassedTime(lastFlipped);
    this.querySelector('.claimed.value').innerHTML = timetools.getPassedTime(claimedAt);
    let timeSinceFlipped = timetools.diffTime(lastFlipped);
    if (timeSinceFlipped < timetools.COUNTDOWN_TIME) {
      this.querySelector('aside').innerHTML = timetools.getCountdown(lastFlipped);
      this.setAttribute('data-new-turn', 'true');
    }
    else {
      this.setAttribute('data-new-turn', 'false');
    }
  }
}
