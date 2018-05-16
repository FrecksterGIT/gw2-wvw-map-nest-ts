import * as SUT from './guild-upgrades';

const mockUpgrades = SUT.default;

jest.mock('./socket', () => ({
  guildUpgrades: jest.fn(() => {
    setTimeout(() => {
      mockUpgrades.upgrades.push({id: 3}, {id: 4});
    }, 200);
  }),
  on: jest.fn((event, callback) => {
    callback([{id: 1}, {id: 2}]);
  })
}));

describe('guildUpgrades', async () => {
  it('should get known upgrades', async () => {
    const spy = jest.spyOn(mockUpgrades, 'isDataAvailable');
    const upgrades = await mockUpgrades.getUpgrades([1, 2]);
    expect(upgrades).toEqual([{id: 1}, {id: 2}]);
    expect(spy.mock.calls.length).toBe(1);
    spy.mockReset();
    spy.mockRestore();
  });
  it('should get unknown upgrades', async () => {
    const spy = jest.spyOn(mockUpgrades, 'isDataAvailable');
    const upgrades = await mockUpgrades.getUpgrades([3, 4]);
    expect(upgrades).toEqual([{id: 3}, {id: 4}]);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(spy.mock.calls.length).toBeLessThanOrEqual(8);
    spy.mockReset();
    spy.mockRestore();
  });
  it('should timeout when not receiving data', async (done) => {
    let catched = false;
    const spy = jest.spyOn(mockUpgrades, 'isDataAvailable');
    mockUpgrades.getUpgrades([5, 6]).catch(err => {
      catched = true;
      expect(err).toBeDefined();
    }).then(() => {
      expect(catched).toBe(true);
      expect(spy.mock.calls.length).toBeGreaterThan(20);
      spy.mockReset();
      spy.mockRestore();
      done();
    });
  });
});
