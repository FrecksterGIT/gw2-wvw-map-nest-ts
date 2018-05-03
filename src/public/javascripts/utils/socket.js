import io from 'socket.io-client';
import log from 'debug';
import Cookie from 'js-cookie';

const logger = log('Socket');

class SocketConnection {

  constructor() {
    this.socketConnection = io('/update');
    this.subscribe();
  }

  subscribe() {
    this.on('connect', () => {
      logger('connected, subscribing for match');
      const matchId = Cookie.get('match');
      this.emit('subscribe', matchId ? matchId : '2-1');
    });

    this.on('subscribed', (data) => {
      logger('successfully subscribed for', data);
    });
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
