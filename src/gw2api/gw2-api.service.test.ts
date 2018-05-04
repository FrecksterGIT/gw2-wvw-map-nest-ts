import {Test} from '@nestjs/testing';
import {Gw2ApiService} from './gw2-api.service';
import {IMatch} from './interfaces/match.interface';

describe('Gw2ApiService', () => {

  let gw2ApiService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [Gw2ApiService]
    }).compile();

    gw2ApiService = module.get(Gw2ApiService);
  });

  it('should get all 51 worlds', async () => {
    const result = await gw2ApiService.getWorlds('en');
    expect(result.length).toEqual(51);
  });

  it('should get all 178 objectives', async () => {
    const result = await gw2ApiService.getObjectives();
    expect(result.length).toEqual(178);
  });

  it('should get data for all 9 matches', async () => {
    const result = await gw2ApiService.getMatches(['all'], 'en');
    expect(result.length).toEqual(9);
  });

  it('should get data for selected matches', async () => {
    const result = await gw2ApiService.getMatches(['1-1', '2-1'], 'en');
    expect(result.length).toEqual(2);
  });

  it('should get current match data (start- and end-time)', async () => {
    const result: IMatch = await gw2ApiService.getMatch('2-1', 'en');
    expect(result).toHaveProperty('scores');
    const startTime = Date.parse(result.start_time);
    const endTime = Date.parse(result.end_time);
    expect(startTime).toBeLessThan(Date.now());
    expect(endTime).toBeGreaterThan(Date.now());
  });
});
