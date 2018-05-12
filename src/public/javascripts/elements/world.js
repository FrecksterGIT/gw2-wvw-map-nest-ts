import log from 'debug';

const logger = log('World');

export default class World extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('.map').forEach((map) => {
      map.addEventListener('click', (event) => this.focusClickHandler(event.target, map));
    });
  }

  focusClickHandler(target, map) {
    if (target.classList.contains('map')) {
      const mapId = map.getAttribute('data-map-id');
      if (mapId === this.focussedMap) {
        this.focussedMap = '';
      } else {
        this.focussedMap = mapId;
      }
    }
  }

  get focussedMap() {
    return this.getAttribute('data-focussed-map');
  }

  set focussedMap(focussedMap) {
    this.setAttribute('data-focussed-map', focussedMap);
  }
}
