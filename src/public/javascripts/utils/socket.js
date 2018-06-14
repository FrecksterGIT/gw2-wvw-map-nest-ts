import io from 'socket.io-client';
import log from 'debug';
import Cookie from 'js-cookie';
import {getLanguage} from '../app';

const logger = log('Socket');

export class SocketConnection {

  constructor() {
    this.version = document.querySelector('[data-version]').getAttribute('data-version');
    this.socketConnection = io('/update');
    this.subscribe();
  }

  subscribe() {
    this.on('connect', () => {
      const matchId = Cookie.get('match');
      this.sendSubscribe(matchId ? matchId : '2-1');
    });

    this.on('subscribed', (data) => {
      logger('successfully subscribed for', data);
    });
  }

  sendSubscribe(matchId) {
    const subscribeData = {
      language: getLanguage(),
      matchId: matchId ? matchId : '2-1'
    };
    this.emit('subscribe', subscribeData);
  }

  guildUpgrades(upgradeIds) {
    const data = {
      data: upgradeIds,
      language: getLanguage()
    };
    this.emit('upgrades', data);
  }

  on(...args) {
    return this.socketConnection.on.apply(this.socketConnection, args);
  }

  emit(...args) {
    return this.socketConnection.emit.apply(this.socketConnection, args);
  }

  register(object, event, options) {
    this.subscribers = this.subscribers || [];
    this.subscribers.push({
      event,
      object,
      options
    });
    this.addListener(event);
  }

  addListener(event) {
    this.listeners = this.listeners || [];
    if (!this.listeners.includes(event)) {
      this.listeners.push(event);
      this.on(event, (data) => {
        this.notify(data);
      });
    }
  }

  notify(data) {
    if (data.version && (data.version !== this.version)) {
      window.location.reload();
      return;
    }
    this.subscribers.forEach((subscriber) => {
      if (subscriber.object.relevantUpdates.includes(data.type)) {
        if (subscriber.options.length > 0) {
          this.notifyFilteredData(subscriber, data);
        }
        else {
          subscriber.object.handleUpdate(data);
        }
      }
    });
  }

  notifyFilteredData(subscriber, data) {
    const options = subscriber.options.find((option) => option.type === data.type);
    const payload = data.payload.find((received) => received.id === options.id);
    if (payload) {
      subscriber.object.handleUpdate({
        id: data.id,
        payload,
        type: data.type
      });
    }
  }
}

const socket = new SocketConnection();

export default socket;
