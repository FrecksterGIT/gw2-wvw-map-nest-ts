import io from 'socket.io-client';
import log from 'debug';

const logger = log('Socket');
const socketConnection = io('/update');

export default socketConnection;

socketConnection.on('connect', () => {
  logger('connected, subscribing for match');
  socketConnection.emit('subscribe', '2-1');
});

socketConnection.on('subscribed', (data) => {
  logger('successfully subscribed for', data);
});
