import log from 'debug';
import UpdateReceiverElement from './update-receiver-element';
import Handlebars from 'handlebars';
import {isToday} from 'date-fns';
import delegate from 'delegate';
import MatchLogEntry from '../utils/match-log-entry';

const i18n = require('i18n-for-browser');
const speechSynthesis = require('speech-synthesis');
const logger = log('MatchLogger');

let worlds = {};
const speechMap = {
    de: 'de-DE',
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR'
};
const MAX_BULK_READ = 5;

export default class MatchLogger extends UpdateReceiverElement {

    constructor() {
        super();
        Handlebars.registerHelper('formatTime', dateTime => MatchLogger.formatTime(dateTime));
    }

    static formatTime(dateTime) {
        const date = new Date(dateTime);
        if (!isToday(date)) {
            return date.toLocaleString();
        }
        return date.toLocaleTimeString();
    }

    connectedCallback() {
        super.connectedCallback();

        const ownerTemplate = this.querySelector('#log-owner-template').innerHTML;
        const claimTemplate = this.querySelector('#log-claim-template').innerHTML;
        this.templateFunctions = {
            claim: Handlebars.compile(claimTemplate),
            owner: Handlebars.compile(ownerTemplate)
        };
        this.initNewMatch = true;
        this.initializeHightlighter();
    }

    initializeHightlighter() {
        delegate(this, '.log_entry', 'click', (event) => {
            const objectId = event.delegateTarget.getAttribute('data-changed-objective');
            const object = document.querySelector('gw2-objective[data-id="' + objectId + '"]');
            object.highlight();
        });
    }

    handleSubscribeUpdate(data) {
        const matchId = this.getAttribute('data-match-id');
        if (matchId !== data.id) {
            this.innerHTML = '';
            MatchLogEntry.resetLog();
            worlds = data.payload.main_worlds;
            this.initNewMatch = true;
        }
    }

    handleObjectiveUpdate(data) {
        const currentChanges = data.payload
            .map((objectData) => {
                const logObject = MatchLogEntry.getLogObject(objectData, worlds);
                return logObject.getChanges(objectData);
            })
            .reduce((changes, entry) => {
                changes.push(...entry);
                return changes;
            }, [])
            .sort((a, b) => {
                const aAt = Date.parse(a.at);
                const bAt = Date.parse(b.at);
                return aAt < bAt ? -1 : (aAt > bAt ? 1 : 0);
            });
        this.logChanges(currentChanges);
    }

    logChanges(changes = []) {
        changes.forEach((change, index) => {
            const element = this.logChange(change);
            if (index >= changes.length - MAX_BULK_READ && this.isSpeechActive(change)) {
                MatchLogger.readChange(element);
            }
        });
        this.initNewMatch = false;
    }

    logChange(change) {
        const content = this.templateFunctions[change.type](change);
        const template = document.createElement('template');
        template.innerHTML = content;
        const element = template.content.firstElementChild;
        this.insertAdjacentElement('afterbegin', element);
        return element;
    }

    static readChange(element) {
        const logText = element.querySelector('.log_message').textContent;
        speechSynthesis(logText, speechMap[i18n.getLocale()]);
    }

    get focussedMap() {
        return this.getAttribute('data-focussed-map') || '';
    }

    isSpeechActive(change) {
        return (this.focussedMap === '' || change.mapId === this.focussedMap)
            && MatchLogger.speechSetOn
            && !this.initNewMatch;
    }

    static get speechSetOn() {
        return !!document.querySelector('.audio.on');
    }
}
