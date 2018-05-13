const logs = [];

export default class MatchLogEntry {

  constructor(objective, worlds) {
    const objectiveElement = document.querySelector('gw2-objective[data-id="' + objective.id + '"]');
    this.id = objective.id;
    this.name = objectiveElement.getAttribute('data-name');
    this.mapId = objectiveElement.getAttribute('data-map-id');
    this.worlds = worlds;
  }

  getOwnerChange(objective) {
    if (objective.owner && objective.owner !== this.owner) {
      const fromClass = this.owner ? this.owner.toLowerCase() : '';
      const fromWorld = this.owner ? this.worlds[fromClass] : '';
      const toClass = objective.owner ? objective.owner.toLowerCase() : '';
      const toWorld = objective.owner ? this.worlds[toClass] : '';
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

  getChanges(objective) {
    const changes = [];
    const ownerChange = this.getOwnerChange(objective);
    if (ownerChange) {
      changes.push(ownerChange);
    }
    const claimChange = this.getClaimedChange(objective);
    if (claimChange) {
      changes.push(claimChange);
    }
    return changes;
  }

  static getLogObject(log, worlds) {
    let logObject = logs.find(o => o.id === log.id);
    if (!logObject) {
      logObject = new MatchLogEntry(log, worlds);
      logs.push(logObject);
    }
    return logObject;
  }

  static resetLog() {
    logs.splice(0, logs.length);
  }
}
