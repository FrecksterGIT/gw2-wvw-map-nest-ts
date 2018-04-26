import {Component} from '@nestjs/common';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IObjective} from '../gw2api/interfaces/objective.interface';
import {IWorld} from '../gw2api/interfaces/world.interface';

@Component()
export class WorldMapService {

  private worldsData: IWorld[];
  private objectivesData: IObjective[];

  constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getMapData(): Promise<IWorld[]> {
    await this.initializeStaticData();
    return this.worldsData;
  }

  private async initializeStaticData() {
    this.worldsData = await this.gw2ApiService.getWorlds();
    this.objectivesData = await this.gw2ApiService.getObjectives();
  }
}
