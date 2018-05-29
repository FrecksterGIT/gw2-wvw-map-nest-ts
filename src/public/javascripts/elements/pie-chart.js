import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Chart from '../utils/chart';

const logger = log('PieChart');

export default class PieChart extends UpdateReceiverElement {

  connectedCallback() {
    super.connectedCallback();
    this.chart = new Chart(this.querySelector('#chart'), [
      {color: '#1e7b2d', percent: 0},
      {color: '#1a4da1', percent: 0},
      {color: '#b02822', percent: 0}
    ]);
  }

  handleScoreUpdate(data) {
    const income = data.payload.income;
    const sum = income.red + income.blue + income.green;
    this.chart.update([
      {percent: income.green / sum},
      {percent: income.blue / sum},
      {percent: income.red / sum}
    ]);
  }
}
