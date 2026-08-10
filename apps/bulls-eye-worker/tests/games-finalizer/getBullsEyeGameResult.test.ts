import { getBullsEyeGameResult } from '../../src/modules/games-finalizer/getBullsEyeGameResult.helper';

import {
  getGamePoolFixtureCase1,
  getGamePoolFixtureCase2,
  getGamePoolFixtureCase3,
  getGamePoolFixtureCase4,
  getGamePoolFixtureCase5,
  getGamePoolFixtureCase6,
  getGamePoolFixtureCase7,
} from './fixtures/getGamePoolFixture';

describe("Unit tests for getBullsEyeGameResult.helper.ts.", () => {
  test("Case 1: 2 winners and poll size is 2", () => {
    const { expectedResult, fixture } = getGamePoolFixtureCase1();

    const result = getBullsEyeGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 2: 3 winners and poll size is 3", () => {
    const { expectedResult, fixture } = getGamePoolFixtureCase2();

    const result = getBullsEyeGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 3: 3 winners and poll size is more then 3", () => {
    const { expectedResult, fixture } = getGamePoolFixtureCase3();

    const result = getBullsEyeGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 4: almost empty pool, game was rejected", () => {
    const { expectedResult, fixture } = getGamePoolFixtureCase4();

    const result = getBullsEyeGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 5: empty pool, game was rejected", () => {
    const { expectedResult, fixture } = getGamePoolFixtureCase5();

    const result = getBullsEyeGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 6: two opponents bet with the same price, won by the person who bet erlier", () => {
    const { expectedResult, fixture } = getGamePoolFixtureCase6();

    const result = getBullsEyeGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 7: end price is null, game was rejected", () => {
    const { expectedResult, fixture } = getGamePoolFixtureCase7();

    const result = getBullsEyeGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });
});
