import {Component, forwardRef, Inject, Logger} from '@nestjs/common';
import {diff} from 'deep-diff';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMatch, IMatchObjective} from '../gw2api/interfaces/match.interface';
import {UpdateType} from './interfaces/updates.enum';
import {UpdateGateway} from './update.gateway';
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
        await this.matchUpdate();
      }, 5000);
    }
  }

  public stopUpdates() {
    Logger.log('stopping updates', 'UpdateService');
    clearInterval(this.updateRunning);
    this.updateRunning = null;
  }

  public async pushFullUpdate(matchId: string): Promise<void> {
    let match = this.matchStates.find((matchState) => matchState.id === matchId);
    if (!match) {
      match = await this.gw2ApiService.getMatch(matchId);
    }
    this.handleDiff(match);
  }

  public async matchUpdate(): Promise<void> {
    const newMatchStates: IMatch[] = [];
    const currentMatchStates = await this.gw2ApiService.getMatches();
    currentMatchStates.forEach(async (currentMatchState) => {
      const oldMatchState = this.matchStates.find((oldMatch) => oldMatch.id === currentMatchState.id);
      await this.handleDiff(currentMatchState, oldMatchState);
      newMatchStates.push(currentMatchState);
    });
    this.matchStates = newMatchStates;
  }

  private handleDiff(newMatchState: IMatch, oldMatchState?: IMatch): void {
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
      this.handleObjectiveChanges(newMatchState, changedObjectives);
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

  private handleObjectiveChanges(matchState: IMatch, changedObjectives: IMatchObjective[]) {
    changedObjectives
      .filter((v, i, a) => a.indexOf(v) === i)
      .forEach((objectiveData) => {
        this.updateGateway.sendUpdate(matchState.id, UpdateType.OBJECTIVE, objectiveData);
      });
  }

  private handleScoresChange(matchState: IMatch): void {
    this.updateGateway.sendUpdate(matchState.id, UpdateType.SCORE, matchState.scores);
  }
}
