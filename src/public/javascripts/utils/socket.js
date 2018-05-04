import io from 'socket.io-client';
import log from 'debug';
import Cookie from 'js-cookie';

const logger = log('Socket');

class SocketConnection {

  constructor() {
    this.socketConnection = io('/update');
    this.subscribe();
  }

  static getLanguage() {
    const path = window.location.pathname;
    const match = /([a-z]{2})/.exec(path);
    return match[1] || 'en';
  }

  subscribe() {
    this.on('connect', () => {
      logger('connected, subscribing for match');
      const matchId = Cookie.get('match');
      this.sendSubscribe(matchId ? matchId : '2-1');
    });

    this.on('subscribed', (data) => {
      logger('successfully subscribed for', data);
    });
  }

  sendSubscribe(matchId) {
    const subscribeData = {
      language: Socket.getLanguage(),
      matchId: matchId ? matchId : '2-1'
    };
    this.emit('subscribe', subscribeData);
  }

  guildUpgrades(upgradeIds) {
    const data = {
      data: upgradeIds,
      language: Socket.getLanguage()
    };
    this.emit('upgrades', data);
  }

  on(...args) {
    return this.socketConnection.on.apply(this.socketConnection, args);
  }

  emit(...args) {
    return this.socketConnection.emit.apply(this.socketConnection, args);
  }

}

const socket = new SocketConnection();

export default socket;
