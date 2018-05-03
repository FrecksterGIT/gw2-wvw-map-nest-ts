import {Injectable} from '@nestjs/common';
import fetch from 'node-fetch';
import {Cache} from '../cache/cache.decorator';
import {IGuild} from './interfaces/guild.interface';
import {IMatchDisplay} from './interfaces/match-display.interface';
import {IMatch, ISkirmish} from './interfaces/match.interface';
import {IObjectiveDisplay} from './interfaces/objective-display.interface';
import {IObjective} from './interfaces/objective.interface';
import {IWorld} from './interfaces/world.interface';

interface IWorldNames {
  allWorlds: string[];
  mainWorld: string;
  linkWorlds: string[];
}

@Injectable()
export class Gw2ApiService {

  private static worldsUrl: string = 'https://api.guildwars2.com/v2/worlds?ids=all';
  private static matchesUrl: string = 'https://api.guildwars2.com/v2/wvw/matches?ids=';
  private static objectivesUrl: string = 'https://api.guildwars2.com/v2/wvw/objectives?ids=all';
  private static guildUrl: string = 'https://api.guildwars2.com/v2/guild/';
  private static guildUpgradeUrl: string = 'https://api.guildwars2.com/v2/guild/upgrades/';
  private static guildUpgradesUrl: string = 'https://api.guildwars2.com/v2/guild/upgrades?ids=';

  private static MAP_SIZES = {
    38: [[8958, 12798], [12030, 15870]],
    95: [[5630, 11518], [8702, 14590]],
    96: [[12798, 10878], [15870, 13950]],
    1099: [[9214, 8958], [12286, 12030]]
  };

  public static getCurrentSkirmish(skirmishes: ISkirmish[]): ISkirmish {
    return skirmishes.reduce((prev, skirmish) => {
      if (!prev) {
        return skirmish;
      }
      if (skirmish.id > prev.id) {
        return skirmish;
      }
      return prev;
    }, null);
  }

  private static async getJSONArray(url: string): Promise<any[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('failed loading url: ' + url);
    }
    return await response.json();
  }

  private static async getJSONObject(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('failed loading url: ' + url);
    }
    return await response.json();
  }

  private static getDisplayCoordForObjective(obj: IObjective, mapId: number): number[] {
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

  @Cache(3600)
  public async getWorlds(): Promise<IWorld[]> {
    return await Gw2ApiService.getJSONArray((Gw2ApiService.worldsUrl));
  }

  @Cache(4)
  public async getMatches(matchIds: string[] = ['all']): Promise<IMatch[]> {
    if (matchIds.length === 0) {
      return [];
    }
    const matchIdsParam = matchIds.join(',');
    return await Gw2ApiService.getJSONArray(Gw2ApiService.matchesUrl + matchIdsParam);
  }

  @Cache(3600)
  public async getObjectives(): Promise<IObjective[]> {
    return await Gw2ApiService.getJSONArray(Gw2ApiService.objectivesUrl);
  }

  @Cache(3600)
  public async getGuildUpgrade(upgradeId: number): Promise<any> {
    return await Gw2ApiService.getJSONObject(Gw2ApiService.guildUpgradeUrl + upgradeId);
  }

  @Cache(3600)
  public async getGuildUpgrades(upgradeIds: string[] = ['all']): Promise<any> {
    if (upgradeIds.length === 0) {
      return [];
    }
    const upgradeIdsParam = upgradeIds.join(',');
    return await Gw2ApiService.getJSONArray(Gw2ApiService.guildUpgradesUrl + upgradeIdsParam);
  }

  @Cache(3600)
  public async getGuild(guildId: string): Promise<IGuild> {
    return await Gw2ApiService.getJSONObject(Gw2ApiService.guildUrl + guildId);
  }

  public async getMatch(matchId: string): Promise<IMatch> {
    const matches = await this.getMatches([matchId]);
    return matches.pop();
  }

  public async getMatchDisplay(match: IMatch): Promise<IMatchDisplay> {
    const display: IMatchDisplay = match;
    const worlds = await this.getWorlds();
    const blueWorlds: IWorldNames = await this.getWorldNamesForMatch(match, 'blue', worlds);
    const greenWorlds: IWorldNames = await this.getWorldNamesForMatch(match, 'green', worlds);
    const redWorlds: IWorldNames = await this.getWorldNamesForMatch(match, 'red', worlds);
    display.world_names = {
      blue: blueWorlds.allWorlds,
      green: greenWorlds.allWorlds,
      red: redWorlds.allWorlds
    };
    display.link_worlds = {
      blue: blueWorlds.linkWorlds,
      green: greenWorlds.linkWorlds,
      red: redWorlds.linkWorlds
    };
    display.main_worlds = {
      blue: blueWorlds.mainWorld,
      green: greenWorlds.mainWorld,
      red: redWorlds.mainWorld
    };
    return display;
  }

  public async getObjectivesDisplay(objectives: IObjective[]): Promise<IObjectiveDisplay[]> {
    const display: IObjectiveDisplay[] = await Promise.all(
      objectives.map(async (obj) => {
        const ret: IObjectiveDisplay = obj;
        ret.display_coord = Gw2ApiService.getDisplayCoordForObjective(obj, ret.map_id);
        return ret;
      }));
    const validMapIds = Object.keys(Gw2ApiService.MAP_SIZES);
    return display.filter((obj) => validMapIds.includes(String(obj.map_id)));
  }

  private getWorldNamesForMatch(match: IMatch, color: string, worlds: IWorld[]): IWorldNames {
    const allWorlds: string[] = [];
    const mainWorld = this.getWorldNameForId(match.worlds[color], worlds);
    allWorlds.push(mainWorld);

    const worldIds = match.all_worlds[color].filter((world) => world !== match.worlds[color]);
    const linkWorlds = this.getWorldNamesForIds(worldIds, worlds);
    allWorlds.concat(linkWorlds);
    return {
      allWorlds,
      linkWorlds,
      mainWorld
    };
  }

  private getWorldNamesForIds(worldIds: number[], worlds: IWorld[]): string[] {
    return worldIds.map((worldId) => this.getWorldNameForId(worldId, worlds));
  }

  private getWorldNameForId(worldId: number, worlds: IWorld[]): string {
    return worlds.find((worldData) => worldData.id === worldId).name;
  }

}
