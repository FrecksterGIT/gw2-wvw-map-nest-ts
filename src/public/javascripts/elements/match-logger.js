import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Handlebars from 'handlebars';
import isToday from 'date-fns/is_today';
import delegate from 'delegate';

const i18n = require('i18n-for-browser');
const speechSynthesis = require('speech-synthesis');
const logger = log('MatchLogger');

let worlds = {};
const speechMap = {
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR'
};

export default class MatchLogger extends UpdateReceiverElement {

  constructor() {
    super();
    Handlebars.registerHelper('formatTime', dateTime => MatchLogger.formatTime(dateTime));
  }

  static formatTime(dateTime) {
    const date = new Date(dateTime);
    if (!isToday(date)) {
      return date.toLocaleString();
    }
    return date.toLocaleTimeString();
  }

  connectedCallback() {
    super.connectedCallback();
    this.loggedData = [];

    const ownerTemplate = this.querySelector('#log-owner-template').innerHTML;
    this.ownerLogFunction = Handlebars.compile(ownerTemplate);

    const claimTemplate = this.querySelector('#log-claim-template').innerHTML;
    this.claimLogFunction = Handlebars.compile(claimTemplate);
    this.pauseAudio();
    this.initializeAudioToggle();
    this.initializeHightlighter();
  }

  initializeHightlighter() {
    delegate(this, '.log_entry', 'click', (event) => {
      const objectId = event.delegateTarget.getAttribute('data-changed-objective');
      const object = document.querySelector('gw2-objective[data-id="' + objectId + '"]');
      object.highlight();
    });
  }

  initializeAudioToggle() {
    const toggle = document.querySelector('.audio');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
    });
  }

  pauseAudio() {
    this.speechActive = false;
    setTimeout(() => {
      this.speechActive = true;
    }, 2500);
  }

  handleSubscribeUpdate(data) {
    this.pauseAudio();
    this.innerHTML = '';
    this.loggedData = [];
    worlds = data.payload.main_worlds;
  }

  handleObjectiveUpdate(data) {
    const allChanges = [];
    data.payload.forEach((newObjectiveData) => {
      let objectiveData = this.loggedData.find((o) => o.id === newObjectiveData.id);
      if (!objectiveData) {
        objectiveData = new LogObject(newObjectiveData);
        this.loggedData.push(objectiveData);
      }
      const ownerChange = objectiveData.getOwnerChange(newObjectiveData);
      const claimChange = objectiveData.getClaimedChange(newObjectiveData);
      if (ownerChange) {
        allChanges.push(ownerChange);
      }
      if (claimChange) {
        allChanges.push(claimChange);
      }
    });
    allChanges.sort((a, b) => {
      const aAt = Date.parse(a.at);
      const bAt = Date.parse(b.at);
      return aAt < bAt ? -1 : (aAt > bAt ? 1 : 0);
    });
    this.logChanges(allChanges);
  }

  logChanges(changes) {
    changes.forEach((change) => {
      let content = '';
      switch (change.type) {
        case 'owner':
          content = this.ownerLogFunction(change);
          break;
        case 'claim':
          content = this.claimLogFunction(change);
          break;
      }
      this.insertAdjacentHTML('afterbegin', content);
      if (change.mapId !== this.focussedMap) {
        if (this.speechActive && document.querySelector('.audio.on')) {
          const logText = this.querySelector('div:first-child .log_message').textContent;
          speechSynthesis(logText, speechMap[i18n.getLocale()]);
        }
      }
    });
  }

  get focussedMap() {
    return this.getAttribute('data-focussed-map');
  }
}

class LogObject {

  constructor(objective) {
    const objectiveElement = document.querySelector('gw2-objective[data-id="' + objective.id + '"]');
    this.id = objective.id;
    this.name = objectiveElement.getAttribute('data-name');
    this.mapId = objectiveElement.getAttribute('data-map-id');
  }

  getOwnerChange(objective) {
    if (objective.owner && objective.owner !== this.owner) {
      const fromClass = this.owner ? this.owner.toLowerCase() : '';
      const fromWorld = this.owner ? worlds[fromClass] : '';
      const toClass = objective.owner ? objective.owner.toLowerCase() : '';
      const toWorld = objective.owner ? worlds[toClass] : '';
      const change = {
        at: objective.last_flipped,
        from: fromWorld,
        fromClass: fromClass,
        id: this.id,
        mapId: this.mapId,
        name: this.name,
        to: toWorld,
        toClass: toClass,
        type: 'owner'
      };
      this.owner = objective.owner;
      this.last_flipped = objective.last_flipped;
      return change;
    }
  }

  getClaimedChange(objective) {
    if (objective.claimed_by && objective.claimed_at !== this.claimed_at) {
      const change = {
        at: objective.claimed_at,
        from: this.claimed_by,
        id: this.id,
        mapId: this.mapId,
        name: this.name,
        objectiveClass: objective.owner.toLowerCase(),
        to: objective.guild.name + ' [' + objective.guild.tag + ']',
        type: 'claim'
      };
      this.claimed_by = objective.claimed_by;
      this.claimed_at = objective.claimed_at;
      return change;
    }
  }
}
