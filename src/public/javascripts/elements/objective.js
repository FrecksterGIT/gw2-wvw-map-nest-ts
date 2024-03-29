import log from 'debug';
import Handlebars from 'handlebars';
import UpdateReceiverElement from './update-receiver-element';
import {timetools} from '../utils/timetools';
import guildUpgrades from '../utils/guild-upgrades';

import campTemplate from '../../../assets/gw2_wvw_map-vector--camp_transparent.svg';
import towerTemplate from '../../../assets/gw2_wvw_map-vector--tower_transparent.svg';
import keepTemplate from '../../../assets/gw2_wvw_map-vector--keep_transparent.svg';
import castleTemplate from '../../../assets/gw2_wvw_map-vector--castle_transparent.svg';

const logger = log('Objective');

export default class Objective extends UpdateReceiverElement {

  static get observedAttributes() {
    return ['data-owner', 'data-last-flipped'];
  }

  get dataNewTurn() {
    return this.getAttribute('data-new-turn');
  }

  set dataNewTurn(newTurn) {
    this.setAttributeIfChanged('data-new-turn', newTurn);
  }

  get dataOwner() {
    return this.getAttribute('data-owner');
  }

  set dataOwner(owner) {
    this.setAttributeIfChanged('data-owner', owner);
  }

  get dataTier() {
    return this.getAttribute('data-tier');
  }

  set dataTier(tier) {
    this.setAttributeIfChanged('data-tier', tier);
  }

  get dataIsClaimed() {
    return this.getAttribute('data-is-claimed');
  }

  set dataIsClaimed(isClaimed) {
    this.setAttributeIfChanged('data-is-claimed', isClaimed);
  }

  get dataLastFlipped() {
    return this.getAttribute('data-last-flipped');
  }

  set dataLastFlipped(lastFlipped) {
    this.setAttributeIfChanged('data-last-flipped', lastFlipped);
  }

  get dataClaimedAt() {
    return this.getAttribute('data-claimed-at');
  }

  set dataClaimedAt(claimedAt) {
    this.setAttributeIfChanged('data-claimed-at', claimedAt);
  }

  set dataPointsTurned(pointsTurned) {
    this.setAttributeIfChanged('data-points-turned', pointsTurned);
  }

  get dataPointsTurned() {
    return this.getAttribute('data-points-turned');
  }

  set dataPointsTick(pointsTick) {
    this.setAttributeIfChanged('data-points-tick', pointsTick);
  }

  get dataPointsTick() {
    return this.getAttribute('data-points-tick');
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
      return yaks + ' / 20';
    }
    if (yaks <= 60) {
      return (yaks - 20) + ' / 40';
    }
    if (yaks < 140) {
      return (yaks - 60) + ' / 80';
    }
    return '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.id = this.getAttribute('data-id');

    const upgradeTemplate = document.querySelector('#upgrade-template').innerHTML;
    this.upgradeFunction = Handlebars.compile(upgradeTemplate);

    this.initSvg();
    this.initElements();
    this.initInfoUpdates();
    this.initCopyChatCode();
    this.guildUpgrades = [];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'data-last-flipped':
        this.initTurnedTimer(newValue);
        break;
    }
  }

  initSvg() {
    const type = this.getAttribute('data-type').toLowerCase();
    const template = Objective.getSvgTemplate(type);
    this.insertAdjacentHTML('afterbegin', template);
  }

  static getSvgTemplate(type) {
    switch (type) {
      case 'camp': return campTemplate;
      case 'tower': return towerTemplate;
      case 'keep': return keepTemplate;
      case 'castle': return castleTemplate;
      default: return '';
    }
  }

  initElements() {
    this.turnedTimerElement = this.querySelector('aside');
    this.infoElement = this.querySelector('section');
    this.emblemElement = this.querySelector('.emblem');
    this.yakCounterElement = this.querySelector('.yaks.value');
    this.guildInfoElement = this.querySelector('.guild.value');
    this.pointsTurnedElement = this.querySelector('.points-turned.value');
    this.pointsTickElement = this.querySelector('.points-tick.value');
    this.heldInfoElement = this.querySelector('.turned.value');
    this.claimedInfoElement = this.querySelector('.claimed.value');
    this.upgradesElement = this.querySelector('.upgrades');
  }

  initInfoUpdates() {
    this.addEventListener('mouseover', () => {
      this.checkInfoBoxVisibility();
      this.startInfoTimers();
    });
    this.addEventListener('mouseout', () => {
      this.stopInfoTimers();
      this.infoElement.classList.remove('left');
    });
  }

  initCopyChatCode() {
    this.addEventListener('click', () => {
      this.copyChatCode();
    });
  }

  checkInfoBoxVisibility() {
    const right = this.infoElement.getBoundingClientRect().right;
    const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (right > windowWidth) {
      this.infoElement.classList.add('left');
    }
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
    const receivedData = data.payload;
    if (receivedData) {
      this.dataOwner = receivedData.owner;
      this.dataTier = Objective.calculateTier(receivedData.yaks_delivered);
      this.dataIsClaimed = !!receivedData.claimed_by;
      this.dataLastFlipped = receivedData.last_flipped;
      this.dataClaimedAt = receivedData.claimed_at;
      this.dataPointsTurned = receivedData.points_capture;
      this.dataPointsTick = receivedData.points_tick;

      guildUpgrades.getUpgrades(receivedData.guild_upgrades).then((upgrades) => {
        this.updateGuildUpgrades(upgrades);
      });

      this.pointsTurnedElement.innerHTML = this.dataPointsTurned;
      this.pointsTickElement.innerHTML = this.dataPointsTick;
      this.yakCounterElement.innerHTML = Objective.getDolyaksOutput(receivedData.yaks_delivered);
      if (receivedData.claimed_by) {
        this.guildInfoElement.innerHTML = receivedData.guild.name + ' [' + receivedData.guild.tag + ']';
        this.emblemElement.style.backgroundImage =
          'url(/emblem/' + receivedData.claimed_by + '/128.png)';
      }
      else {
        this.emblemElement.style.backgroundImage = '';
      }
    }
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

  updateGuildUpgrades(upgrades) {
    if (upgrades.length === 0) {
      this.upgradesElement.innerHTML = '';
    }
    const notBothEmpty = this.guildUpgrades.length !== 0 && upgrades.length !== 0;
    if (!upgrades.every((upgrade) => this.guildUpgrades.includes(upgrade)) && !notBothEmpty) {
      this.upgradesElement.innerHTML = '';
      upgrades.forEach((upgrade) => {
        this.upgradesElement.insertAdjacentHTML('beforeend', this.upgradeFunction(upgrade));
      });
    }
    this.guildUpgrades = upgrades;
  }

  getRegisterOptions() {
    return [{
      id: this.getAttribute('data-id'),
      type: 'ObjectiveUpdate'
    }];
  }

  highlight(count = 0) {
    this.classList.toggle('highlight');
    if (count <= 2) {
      setTimeout(() => {
        this.highlight(++count);
      }, 500);
    }
  }
}
