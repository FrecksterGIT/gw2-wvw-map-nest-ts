import {Component, forwardRef, Inject, Logger} from '@nestjs/common';
import {diff} from 'deep-diff';
import deepcopy from 'ts-deepcopy';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IColorsWithNumbers, IMatch, IMatchObjective} from '../gw2api/interfaces/match.interface';
import {UpdateGateway} from './update.gateway';
import {ObjectiveUpdate} from './updates/objective-update';
import {ScoreUpdate} from './updates/score-update';
import {SubscribeUpdate} from './updates/subscribe-update';
import IDiff = deepDiff.IDiff;

@Component()
export class UpdateService {

  private matchStates: IMatch[] = [];
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
        this.matchUpdate().then().catch();
      }, 5000);
    }
  }

  public stopUpdates() {
    Logger.log('stopping updates', 'UpdateService');
    clearInterval(this.updateRunning);
    this.updateRunning = null;
  }

  public async pushFullUpdate(matchId: string): Promise<void> {
    const match = await this.gw2ApiService.getMatch(matchId);
    const display = await this.gw2ApiService.getMatchDisplay(match);
    const update = new SubscribeUpdate(display);
    this.updateGateway.sendUpdate(update);
    await this.handleDiff(match);
  }

  public async matchUpdate(): Promise<void> {
    const subscribedMatches = this.updateGateway.subscribedMatches;
    if (subscribedMatches.length === 0) {
      return;
    }
    const currentMatchStates = await this.gw2ApiService.getMatches(subscribedMatches);
    const saveCurrentMatchStates: IMatch[] = deepcopy<IMatch[]>(currentMatchStates);
    currentMatchStates.forEach(async (currentMatchState) => {
      const oldMatchState = this.matchStates.find((oldMatch) => oldMatch.id === currentMatchState.id);
      await this.handleDiff(currentMatchState, oldMatchState);
    });
    this.matchStates = saveCurrentMatchStates;
  }

  private async handleDiff(newMatchState: IMatch, oldMatchState?: IMatch): Promise<void> {
    let oldMatch = {};
    if (oldMatchState) {
      oldMatch = oldMatchState;
    }
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
              this.handleScoresChange(newMatchState);
              scoresSend = true;
            }
            break;
        }
      });
      const changed: IMatchObjective[] = [...changedObjectives];
      await this.handleObjectiveChanges(newMatchState, changed);
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

  private async handleObjectiveChanges(matchState: IMatch, changedObjectives: IMatchObjective[]) {
    if (changedObjectives.length > 0) {
      let objectives = changedObjectives
        .filter((v, i, a) => a.indexOf(v) === i);
      objectives = await Promise.all(
        objectives.map(async (obj) => {
          if (obj.claimed_by) {
            obj.guild = await this.gw2ApiService.getGuild(obj.claimed_by);
          }
          return obj;
        }));
      const update = new ObjectiveUpdate(matchState.id, objectives);
      this.updateGateway.sendUpdate(update);
    }
  }

  private handleScoresChange(matchState: IMatch): void {
    const currentScores = matchState.skirmishes.pop().scores;
    const update = new ScoreUpdate(matchState.id, {
      income: this.calculateIncome(matchState),
      scores: currentScores,
      victoryPoints: matchState.victory_points
    });
    this.updateGateway.sendUpdate(update);
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
          case 'Blue': income.blue += obj.points_tick; break;
          case 'Green': income.green += obj.points_tick; break;
          case 'Red': income.red += obj.points_tick; break;
        }
      });
    });
    return income;
  }
}
