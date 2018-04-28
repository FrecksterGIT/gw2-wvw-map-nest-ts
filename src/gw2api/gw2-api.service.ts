import fetch from 'node-fetch';
import {Cache} from './decorators/cache.decorator';
import {IMatchDisplay} from './interfaces/match-display.interface';
import {IMatch} from './interfaces/match.interface';
import {IObjective} from './interfaces/objective.interface';
import {IWorld} from './interfaces/world.interface';

export class Gw2ApiService {
  private static worldsUrl: string = 'https://api.guildwars2.com/v2/worlds?ids=all';
  private static matchesUrl: string = 'https://api.guildwars2.com/v2/wvw/matches?ids=all';
  private static matchUrl: string = 'https://api.guildwars2.com/v2/wvw/matches/';
  private static objectivesUrl: string = 'https://api.guildwars2.com/v2/wvw/objectives?ids=all';

  private static async getJSONArray(url: string): Promise<any[]> {
    const response = await fetch(url);
    return response.json();
  }

  private static async getJSONObject(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }

  @Cache(3600)
  public async getWorlds(): Promise<IWorld[]> {
    return await Gw2ApiService.getJSONArray((Gw2ApiService.worldsUrl));
  }

  @Cache(5)
  public async getMatches(): Promise<IMatch[]> {
    return await Gw2ApiService.getJSONArray(Gw2ApiService.matchesUrl);
  }

  @Cache(3600)
  public async getObjectives(): Promise<IObjective[]> {
    return await Gw2ApiService.getJSONArray(Gw2ApiService.objectivesUrl);
  }

  @Cache(5)
  public async getMatch(id: string): Promise<IMatch> {
    return await Gw2ApiService.getJSONObject(Gw2ApiService.matchUrl + id);
  }

  public async getMatchDisplay(match: IMatch): Promise<IMatchDisplay> {
    const display: IMatchDisplay = match;
    display.world_names = {
      blue: await this.getWorldNamesForIds(match.all_worlds.blue),
      green: await this.getWorldNamesForIds(match.all_worlds.green),
      red: await this.getWorldNamesForIds(match.all_worlds.red)
    }
    ;
    return display;
  }

  private async getWorldNamesForIds(worldIds: number[]): Promise<string[]> {
    return await Promise.all(
      worldIds.map(async (worldId): Promise<string> => await this.getWorldNameForId(worldId))
    );
  }

  private async getWorldNameForId(worldId: number): Promise<string> {
    return ((await this.getWorlds()).find((worldData) => worldData.id === worldId)).name;
  }

}
