import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';

import bloodlustRed from '../../assets/gw2_wvw_map-vector--bloodlust_red.svg';
import bloodlustBlue from '../../assets/gw2_wvw_map-vector--bloodlust_blue.svg';
import bloodlustGreen from '../../assets/gw2_wvw_map-vector--bloodlust_green.svg';
import {ID_ETERNAL_BATTLEGROUNDS, MAP_IDS} from '../utils/constants';

const logger = log('World');

export default class World extends UpdateReceiverElement {
  connectedCallback() {
    super.connectedCallback();
    this.initElements();
    this.initMapFocusClick();
  }

  initElements() {
    this.matchLogger = document.querySelector('gw2-match-logger');
    const bloodlust = bloodlustRed + bloodlustGreen + bloodlustBlue;
    this.maps = {};
    MAP_IDS.forEach((id) => {
      this.maps[id] = this.querySelector('.map[data-map-id="' + id + '"]');
      if (id !== ID_ETERNAL_BATTLEGROUNDS) {
        this.maps[id].insertAdjacentHTML('afterbegin', bloodlust);
      }
    });
  }

  initMapFocusClick() {
    Object.values(this.maps).forEach((map) => {
      map.addEventListener('click', (event) => this.focusClickHandler(event.target, map));
    });
  }

  handleBloodlustUpdate(data) {
    data.payload.forEach((payload) => {
      this.maps[payload.mapId].setAttribute('data-bloodlust', payload.bonus.owner.toLowerCase());
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
    this.matchLogger.setAttribute('data-focussed-map', focussedMap);
    this.setAttribute('data-focussed-map', focussedMap);
  }
}
