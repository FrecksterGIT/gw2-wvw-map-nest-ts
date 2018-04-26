import {Test} from '@nestjs/testing';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {WorldMapService} from './world-map.service';

describe('MapService', () => {

  let mapService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      components: [WorldMapService, Gw2ApiService]
    }).compile();

    mapService = module.get(WorldMapService);
  });

  it('should do something', async () => {
    expect(true).toBe(true);
  });
});
