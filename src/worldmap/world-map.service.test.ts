import {Test} from '@nestjs/testing';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {WorldMapService} from './world-map.service';

describe('MapService', () => {

  let mapService: WorldMapService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [Gw2ApiService, WorldMapService]
    }).compile();

    mapService = module.get(WorldMapService);
  });

  xit('should get data for all matches', async () => {
    const matches = await mapService.getMatchesData('en');
    expect(matches.length > 5).toBeTruthy();
  });

  it('should get data for all 4 maps', async () => {
    const objectives = await mapService.getObjectives('en');
    expect(objectives[38].length).toEqual(28);
    expect(objectives[95].length).toEqual(21);
    expect(objectives[96].length).toEqual(21);
    expect(objectives[1099].length).toEqual(21);
  });
});
