import {forwardRef, Inject, Injectable, Logger} from '@nestjs/common';
import {diff} from 'deep-diff';
import deepcopy from 'ts-deepcopy';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IColorsWithNumbers, IMatch, IMatchObjective} from '../gw2api/interfaces/match.interface';
import IBloodlustData from './interfaces/bloodlust-payload.interface';
import {UpdateGateway} from './update.gateway';
import {BloodlustUpdate} from './updates/bloodlust-update';
import {ObjectiveUpdate} from './updates/objective-update';
import {ScoreUpdate} from './updates/score-update';
import {SubscribeUpdate} from './updates/subscribe-update';
import IDiff = deepDiff.IDiff;

@Injectable()
export class UpdateService {

  private matchStates = [];
  private updateRunning;

  constructor(
    private readonly gw2ApiService: Gw2ApiService,
    @Inject(forwardRef(() => UpdateGateway))
    private readonly updateGateway: UpdateGateway) {
  }

  public startUpdates() {
    if (!this.updateRunning) {
      Logger.log('starting updates', 'UpdateService');
      this.updateRunning = setInterval(async () => {
        this.updateGateway.getSubscribedLanguages().forEach((language) => {
          this.matchUpdate(language).then().catch();
        });
      }, 5000);
    }
  }

  public stopUpdates() {
    Logger.log('stopping updates', 'UpdateService');
    clearInterval(this.updateRunning);
    this.updateRunning = null;
  }

  public async pushFullUpdate(matchId: string, lang: string): Promise<void> {
    const match = await this.gw2ApiService.getMatch(matchId, lang);
    const display = await this.gw2ApiService.getMatchDisplay(match, lang);
    const update = new SubscribeUpdate(display);
    this.updateGateway.sendUpdate(update, lang);
    await this.handleDiff(match, null, lang);
    await this.handleBloodlustChange(match, null, lang);
  }

  public async matchUpdate(lang): Promise<void> {
    const subscribedMatches = this.updateGateway.getSubscribedMatches(lang);
    if (subscribedMatches.length === 0) {
      return;
    }
    this.matchStates[lang] = this.matchStates[lang] || [];
    try {
      const currentMatchStates = await this.gw2ApiService.getMatchesByIds(subscribedMatches, lang);
      const saveCurrentMatchStates: IMatch[] = deepcopy<IMatch[]>(currentMatchStates);

      currentMatchStates.forEach(async (currentMatchState) => {
        const oldMatchState = this.matchStates[lang].find((oldMatch) => oldMatch.id === currentMatchState.id);
        await this.handleDiff(currentMatchState, oldMatchState, lang);
      });
      this.matchStates[lang] = saveCurrentMatchStates;
    } catch (e) {
      // noop, just try again next time...
    }
  }

  private async handleDiff(newMatchState: IMatch, oldMatchState: IMatch, lang: string): Promise<void> {
    let oldMatch = {};
    if (oldMatchState) {
      oldMatch = oldMatchState;
    }
    this.handleBloodlustChange(newMatchState, oldMatchState, lang);
    const changes: IDiff[] = diff(oldMatch, newMatchState);
    if (changes) {
      const changedObjectives: IMatchObjective[] = [];
      let scoresSend = false;
      changes.forEach((change) => {
        switch (change.path[0]) {
          case 'maps':
            this.getObjectivesForMapChange(newMatchState, change).forEach((mapChange) => {
              changedObjectives.push(mapChange);
            });
            break;
          case 'scores':
            if (!scoresSend) {
              this.handleScoresChange(newMatchState, lang);
              scoresSend = true;
            }
            break;
        }
      });
      const changed: IMatchObjective[] = [...changedObjectives];
      await this.handleObjectiveChanges(newMatchState, changed, lang);
    }
  }

  private getObjectivesForMapChange(matchState: IMatch, change: IDiff): IMatchObjective[] {
    const objectives: IMatchObjective[] = [];
    if (change.path.length >= 4 && change.path[2] === 'objectives') {
      objectives.push(matchState[change.path[0]][change.path[1]][change.path[2]][change.path[3]]);
    }
    else if (change.path.length === 1 && change.path[0] === 'maps') {
      matchState.maps.forEach((map) => {
        map.objectives.forEach((obj) => {
          objectives.push(obj);
        });
      });
    }
    return objectives;
  }

  private async handleObjectiveChanges(
    matchState: IMatch,
    changedObjectives: IMatchObjective[],
    lang: string): Promise<void> {
    if (changedObjectives.length > 0) {

      const validTypes = [
        'Camp',
        'Tower',
        'Keep',
        'Castle'
      ];

      let objectives = changedObjectives
        .filter((v, i, a) => a.indexOf(v) === i)
        .filter((v) => validTypes.includes(v.type));

      objectives = await Promise.all<IMatchObjective>(
        objectives.map(async (obj): Promise<IMatchObjective> => {
          if (obj.claimed_by) {
            obj.guild = await this.gw2ApiService.getGuild(obj.claimed_by);
          }
          return obj;
        }));
      const update = new ObjectiveUpdate(matchState.id, objectives);
      this.updateGateway.sendUpdate(update, lang);
    }
  }

  private handleScoresChange(matchState: IMatch, lang: string): void {
    const currentScores = Gw2ApiService.getCurrentSkirmish(matchState.skirmishes).scores;
    const update = new ScoreUpdate(matchState.id, {
      income: this.calculateIncome(matchState),
      scores: currentScores,
      victoryPoints: matchState.victory_points
    });
    this.updateGateway.sendUpdate(update, lang);
  }

  private handleBloodlustChange(newMatchState, oldMatchState, lang) {
    const oldBloodlust: IBloodlustData[] = this.getBloodlustData(oldMatchState);
    const newBloodlust: IBloodlustData[] = this.getBloodlustData(newMatchState);

    const diffs = diff(oldBloodlust, newBloodlust);
    if (diffs) {
      const update = new BloodlustUpdate(newMatchState.id, newBloodlust);
      this.updateGateway.sendUpdate(update, lang);
    }
  }

  private getBloodlustData(state): IBloodlustData[] {
    if (!state || !state.maps) {
      return null;
    }
    return state.maps
      .filter((map) => [95, 96, 1099].includes(map.id))
      .map((map): IBloodlustData => {
        return {
          bonus: map.bonuses.find((bonus) => bonus.type === 'Bloodlust'),
          mapId: map.id
        };
      });
  }

  private calculateIncome(matchState: IMatch): IColorsWithNumbers {
    const income = {
      blue: 0,
      green: 0,
      red: 0
    };
    matchState.maps.forEach((map) => {
      map.objectives.forEach((obj) => {
        switch (obj.owner) {
          case 'Blue':
            income.blue += obj.points_tick;
            break;
          case 'Green':
            income.green += obj.points_tick;
            break;
          case 'Red':
            income.red += obj.points_tick;
            break;
        }
      });
    });
    return income;
  }
}
