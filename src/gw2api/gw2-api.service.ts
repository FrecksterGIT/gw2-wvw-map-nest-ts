import fetch from 'node-fetch';
import {Cache} from '../cache/cache.decorator';
import {IGuild} from './interfaces/guild.interface';
import {IMatchDisplay} from './interfaces/match-display.interface';
import {IMap, IMatch} from './interfaces/match.interface';
import {IObjectiveDisplay} from './interfaces/objective-display.interface';
import {IObjective} from './interfaces/objective.interface';
import {IWorld} from './interfaces/world.interface';

export class Gw2ApiService {

  private static worldsUrl: string = 'https://api.guildwars2.com/v2/worlds?ids=all';
  private static matchesUrl: string = 'https://api.guildwars2.com/v2/wvw/matches?ids=';
  private static objectivesUrl: string = 'https://api.guildwars2.com/v2/wvw/objectives?ids=all';
  private static guildUrl: string = 'https://api.guildwars2.com/v2/guild/';

  private static MAP_SIZES = {
    38: [[8958, 12798], [12030, 15870]],
    95: [[5630, 11518], [8702, 14590]],
    96: [[12798, 10878], [15870, 13950]],
    1099: [[9214, 8958], [12286, 12030]]
  };

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
  public async getMatches(matchIds: string[]): Promise<IMatch[]> {
    let matchIdsParam = 'all';
    if (matchIds.length > 0) {
      matchIdsParam = matchIds.join(',');
    }
    return await Gw2ApiService.getJSONArray(Gw2ApiService.matchesUrl + matchIdsParam);
  }

  @Cache(3600)
  public async getObjectives(): Promise<IObjective[]> {
    return await Gw2ApiService.getJSONArray(Gw2ApiService.objectivesUrl);
  }

  @Cache(3600)
  public async getGuild(guildId: string): Promise<IGuild> {
    return await Gw2ApiService.getJSONObject(Gw2ApiService.guildUrl + guildId);
  }

  public async getMatch(id: string): Promise<IMatch> {
    return (await this.getMatches([id])).pop();
  }

  public async getAllMatches(): Promise<IMatch[]> {
    return await this.getMatches(['all']);
  }

  public async getMatchDisplay(match: IMatch): Promise<IMatchDisplay> {
    const display: IMatchDisplay = match;
    display.world_names = {
      blue: await this.getWorldNamesForMatch(match, 'blue'),
      green: await this.getWorldNamesForMatch(match, 'green'),
      red: await this.getWorldNamesForMatch(match, 'red')
    };
    return display;
  }

  public async getObjectivesDisplay(objectives: IObjective[]): Promise<IObjectiveDisplay[]> {
    const aMatch: IMatch = await this.getMatch('2-1');
    const display: IObjectiveDisplay[] = await Promise.all(
      objectives.map(async (obj) => {
        const ret: IObjectiveDisplay = obj;
        ret.map = await this.getMapForObjective(obj, aMatch);
        ret.display_coord = this.getDisplayCoordForObjective(obj, ret.map);
        return ret;
      }));
    return display.filter((obj) => obj.map !== 0);
  }

  private getDisplayCoordForObjective(obj: IObjective, mapId: number): number[] {
    const map = Gw2ApiService.MAP_SIZES[mapId];
    if (map) {
      const mapSize = [
        map[1][0] - map[0][0],
        map[1][1] - map[0][1]
      ];
      const point = obj.coord;
      if (point) {
        const coord = [
          point[0] - map[0][0],
          point[1] - map[0][1]
        ];
        return [
          coord[0] / mapSize[0] * 100,
          coord[1] / mapSize[1] * 100
        ];
      }
    }
    return [0, 0];
  }

  private async getMapForObjective(objective: IObjective, match: IMatch): Promise<number> {
    const aMap: IMap = (match.maps.filter((map) => map.objectives.find((obj) => obj.id === objective.id))).pop();
    if (!aMap) {
      return 0;
    }
    return aMap.id;
  }

  private async getWorldNamesForMatch(match: IMatch, color: string): Promise<string[]> {
    const worlds = await this.getWorlds();
    const result: string[] = [];
    result.push(this.getWorldNameForId(match.worlds[color], worlds));

    const worldIds = match.all_worlds[color].filter((world) => world !== match.worlds[color]);
    result.concat(await this.getWorldNamesForIds(worldIds));
    return result;
  }

  private async getWorldNamesForIds(worldIds: number[]): Promise<string[]> {
    const worlds = await this.getWorlds();
    return worldIds.map((worldId) => this.getWorldNameForId(worldId, worlds));
  }

  private getWorldNameForId(worldId: number, worlds: IWorld[]): string {
    return worlds.find((worldData) => worldData.id === worldId).name;
  }

}
