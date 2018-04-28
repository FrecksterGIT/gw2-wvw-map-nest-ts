// tslint:disable:no-console

const socket = io('/update');
socket.on('connect', () => {
  console.log('connected, subscribing for match');
  socket.emit('subscribe', '2-1');
});
socket.on('subscribed', (data) => {
  console.log('successfully subscribed for', data);
});
socket.on('update', (data) => {
  // console.log(data);
});

document.querySelectorAll('.match').forEach((match) => {
  match.addEventListener('click', (event) => {
    const matchId = event.target.getAttribute('data-match-id');
    socket.emit('subscribe', matchId);
  });
});
