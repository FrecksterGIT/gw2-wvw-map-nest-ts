import fetch from 'node-fetch';
import {Cache} from './decorators/cache.decorator';
import {IMatch} from './interfaces/match.interface';
import {IObjective} from './interfaces/objective.interface';
import {IWorld} from './interfaces/world.interface';

export class Gw2ApiService {
  private static worldsUrl: string = 'https://api.guildwars2.com/v2/worlds?ids=all';
  private static matchesUrl: string = 'https://api.guildwars2.com/v2/wvw/matches?ids=all';
  private static matchUrl: string = 'https://api.guildwars2.com/v2/wvw/matches/';
  private static objectivesUrl: string = 'https://api.guildwars2.com/v2/wvw/objectives?ids=all';

  @Cache(3600)
  public async getWorlds(): Promise<IWorld[]> {
    return await this.getJSONArray((Gw2ApiService.worldsUrl));
  }

  @Cache(5)
  public async getMatches(): Promise<IMatch[]> {
    return await this.getJSONArray(Gw2ApiService.matchesUrl);
  }

  @Cache(3600)
  public async getObjectives(): Promise<IObjective[]> {
    return await this.getJSONArray(Gw2ApiService.objectivesUrl);
  }

  @Cache(5)
  public async getMatch(id: string): Promise<IMatch> {
    return await this.getJSONObject(Gw2ApiService.matchUrl + id);
  }

  private async getJSONArray(url: string): Promise<any[]> {
    const response = await fetch(url);
    return response.json();
  }

  private async getJSONObject(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }
}
