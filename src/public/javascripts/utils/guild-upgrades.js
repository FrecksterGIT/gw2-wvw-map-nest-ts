import socket from './socket';

class GuildUpgrades {
  constructor() {
    this.waitTimeout = 1000;
    this.upgrades = [];
    socket.on('upgrades', (data) => {
      this.upgrades.push(...data);
    });
  }

  getUpgrades(upgradeIds = []) {
    if (this.isDataAvailable(upgradeIds)) {
      return Promise.resolve(this.getUpgradesData(upgradeIds));
    }

    socket.guildUpgrades(upgradeIds);

    const started = Date.now();
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.isDataAvailable(upgradeIds)) {
          clearInterval(interval);
          resolve(this.getUpgradesData(upgradeIds));
        }
        if (Date.now() > started + this.waitTimeout) {
          clearInterval(interval);
          reject('upgrades not received in time');
        }
      }, 50);
    });
  }

  isDataAvailable(upgradeIds) {
    return upgradeIds.every((upgradeId) => this.upgrades.find((known) => known.id === upgradeId));
  }

  getUpgradesData(upgradeIds) {
    return upgradeIds.map((upgradeId) => this.upgrades.find((known) => known.id === upgradeId));
  }

}

const guildUpgrades = new GuildUpgrades();

export default guildUpgrades;
