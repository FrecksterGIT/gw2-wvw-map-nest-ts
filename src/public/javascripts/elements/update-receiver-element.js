import socket from '../utils/socket';

export default class UpdateReceiverElement extends HTMLElement {

  get relevantUpdates() {
    this.subscribed = this.subscribed || [];
    if (this.subscribed.length === 0) {
      this.subscribed = this.getAttribute('data-subscribe')
        .split(',').map((type) => type.trim());
    }
    return this.subscribed;
  }

  connectedCallback() {
    socket.register(this, 'update', this.getRegisterOptions());
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

  getRegisterOptions() {
    return [];
  }
}
