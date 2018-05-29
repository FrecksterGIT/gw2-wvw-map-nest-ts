import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';

const logger = log('BarChart');

export default class BarChart extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();
    this.green = this.querySelector('.green');
    this.blue = this.querySelector('.blue');
    this.red = this.querySelector('.red');
  }

  handleScoreUpdate(data) {
    const values = data.payload.scores;
    const max = Math.max(...Object.values(values));
    this.green.style.width = (values.green / max * 100) + '%';
    this.blue.style.width = (values.blue / max * 100) + '%';
    this.red.style.width = (values.red / max * 100) + '%';
  }
}
