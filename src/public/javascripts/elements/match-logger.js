import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Handlebars from 'handlebars';
import isToday from 'date-fns/is_today';

const logger = log('MatchLogger');

let worlds = {};

export default class MatchLogger extends UpdateReceiverElement {

  constructor() {
    super();
    Handlebars.registerHelper('formatTime', dateTime => {
      const date = new Date(dateTime);
      if (!isToday(date)) {
        return date.toLocaleString();
      }
      return date.toLocaleTimeString();
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.loggedData = [];

    const ownerTemplate = this.querySelector('#log-owner-template').innerHTML;
    this.ownerLogFunction = Handlebars.compile(ownerTemplate);

    const claimTemplate = this.querySelector('#log-claim-template').innerHTML;
    this.claimLogFunction = Handlebars.compile(claimTemplate);
  }

  handleSubscribeUpdate(data) {
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
      logger(change);
      let content = '';
      switch (change.type) {
        case 'owner':
          content = this.ownerLogFunction(change, {data: this.intlData});
          break;
        case 'claim':
          content = this.claimLogFunction(change, {data: this.intlData});
          break;
      }
      this.insertAdjacentHTML('afterbegin', content);
    });
  }
}

class LogObject {

  constructor(objective) {
    this.id = objective.id;
    this.name = document.querySelector('gw2-objective[data-id="' + this.id + '"]').getAttribute('data-name');
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
