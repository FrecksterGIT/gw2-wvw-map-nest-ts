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

  it('should get all objectives for relevant maps', async () => {
    const result = await gw2ApiService.getObjectivesDisplay('en');
    expect(result.length).toEqual(91);
  });

  it('should get data for all 9 matches', async () => {
    const result = await gw2ApiService.getMatches('en');
    expect(result.length).toEqual(9);
  });

  it('should get data for selected matches', async () => {
    const result = await gw2ApiService.getMatchesByIds(['1-1', '2-1'], 'en');
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

  it('should get data for guilds', async () => {
    const guild = await gw2ApiService.getGuild('d5666a91-2c0a-4417-a8aa-f79c1587d642');
    expect(guild.name).toEqual('Art Of Skills');
  });

  it('should get guild upgrades', async () => {
    const upgrades = await gw2ApiService.getGuildUpgrades(['all'], 'en');
    expect(upgrades.length).toBeGreaterThan(760);
    const upgrades2 = await gw2ApiService.getGuildUpgrades([38, 43], 'en');
    expect(upgrades2.length).toEqual(2);
    expect(upgrades2[0].name).toEqual('Guild Armorer 1');
  });

  it('should get a skirmish for a match', async () => {
    const match = await gw2ApiService.getMatch('2-1', 'en');
    const skirmish = Gw2ApiService.getCurrentSkirmish(match.skirmishes);
    expect(skirmish.scores.red).toBeDefined();
  });
});
