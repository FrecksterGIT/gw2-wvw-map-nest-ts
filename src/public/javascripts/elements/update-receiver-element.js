import socket from '../utils/socket';

export default class UpdateReceiverElement extends HTMLElement {

  connectedCallback() {
    socket.on('update', (data) => {
      this.handleUpdate(data);
    });
  }

  handleUpdate(data) {
    if (this.relevantUpdates.includes(data.type)) {
      switch (data.type) {
        case 'ScoreUpdate':
          this.handleScoreUpdate(data);
          break;
        case 'ObjectiveUpdate':
          this.handleObjectiveUpdate(data);
          break;
        case 'SubscribeUpdate':
          this.handleSubscribeUpdate(data);
          break;
      }
    }
  }

  handleSubscribeUpdate(data) {
    throw new Error('UpdateReceiverElement.handleSubscribeUpdate is abstract');
  }

  handleScoreUpdate(data) {
    throw new Error('UpdateReceiverElement.handleScoreUpdate is abstract');
  }

  handleObjectiveUpdate(data) {
    throw new Error('UpdateReceiverElement.handleObjectiveUpdate is abstract');
  }

  get relevantUpdates() {
    const subscribe = this.getAttribute('data-subscribe');
    return subscribe.split(',').map((type) => type.trim());
  }
}
