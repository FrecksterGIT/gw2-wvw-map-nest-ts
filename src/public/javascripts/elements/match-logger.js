import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Handlebars from 'handlebars';

const logger = log('MatchLogger');

class Owner {

  constructor(objective) {
    this.id = objective.id;
    this.name = objective.name;
  }

  getOwnerChange(objective) {
    if (objective.owner && objective.owner !== this.owner) {
      const change = {
        at: objective.last_flipped,
        from: this.owner,
        id: this.id,
        name: this.name,
        to: objective.owner,
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
        to: objective.guild.name + ' [' + objective.guild.tag + ']',
        type: 'claim'
      };
      this.claimed_by = objective.claimed_by;
      this.claimed_at = objective.claimed_at;
      return change;
    }
  }
}

export default class MatchLogger extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();
    this.loggedData = [];

    const ownerTemplate = this.querySelector('#log-owner-template').innerHTML;
    this.ownerLogFunction = Handlebars.compile(ownerTemplate);

    const claimTemplate = this.querySelector('#log-claim-template').innerHTML;
    this.claimLogFunction = Handlebars.compile(claimTemplate);
  }

  handleObjectiveUpdate(data) {
    const allChanges = [];
    data.payload.forEach((newObjectiveData) => {
      let objectiveData = this.loggedData.find((o) => o.id === newObjectiveData.id);
      if (!objectiveData) {
        objectiveData = new Owner(newObjectiveData);
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
          content = this.ownerLogFunction(change);
          break;
        case 'claim':
          content = this.claimLogFunction(change);
          break;
      }
      this.insertAdjacentHTML('afterbegin', content);
    });
  }
}
