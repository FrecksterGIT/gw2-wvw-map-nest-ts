// tslint:disable:no-console

class Socket {
  constructor() {
    this.socket = io('/update');
    this.socket.on('connect', () => {
      console.log('connected, subscribing for match');
      socket.emit('subscribe', '2-1');
    });
    this.socket.on('subscribed', (data) => {
      console.log('successfully subscribed for', data);
    });
  }
  emit(event, data) {
    this.socket.emit(event, data);
  }
}

const socket = new Socket();

document.querySelectorAll('.match').forEach((match) => {
  match.addEventListener('click', (event) => {
    const matchId = event.target.getAttribute('data-match-id');
    socket.emit('subscribe', matchId);
  });
});
