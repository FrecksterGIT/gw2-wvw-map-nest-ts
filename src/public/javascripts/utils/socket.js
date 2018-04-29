import io from 'socket.io-client';
import log from 'debug';
import Cookie from 'js-cookie';

const logger = log('Socket');
const socketConnection = io('/update');

export default socketConnection;

socketConnection.on('connect', () => {
  logger('connected, subscribing for match');
  const matchId = Cookie.get('match');
  socketConnection.emit('subscribe', matchId ? matchId : '2-1');
});

socketConnection.on('subscribed', (data) => {
  logger('successfully subscribed for', data);
});
