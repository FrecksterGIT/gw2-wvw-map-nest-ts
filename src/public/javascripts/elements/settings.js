export default class Settings extends HTMLElement {

  connectedCallback() {
    this.audioElement = this.querySelector('.audio');
    this.worldElement = this.querySelector('.world');
    this.statsElement = this.querySelector('.stats');

    this.matchSelectorElement = document.querySelector('gw2-match-selector');
    this.statisticsElement = document.querySelector('gw2-match-statistics');

    this.initEvents();
  }

  initEvents() {
    this.audioElement.addEventListener('click', () => {
      if (this.audioElement.classList.contains('on')) {
        this.audioElement.classList.remove('on');
        window.speechSynthesis.cancel();
      } else {
        this.audioElement.classList.add('on');
      }
    });

    this.worldElement.addEventListener('click', () => {
      this.matchSelectorElement.isOpen = true;
    });

    this.statsElement.addEventListener('click', () => {
      if (this.statsElement.classList.contains('on')) {
        this.statisticsElement.setAttribute('data-open', 'false');
        this.statsElement.classList.remove('on');
      } else {
        this.statisticsElement.setAttribute('data-open', 'true');
        this.statsElement.classList.add('on');
      }
    });
  }
}
