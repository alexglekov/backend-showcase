import { getSetupGameResult } from '../../src/modules/games-finalizer/getSetupGameResult.helper';
import {
  getGameParamsFixtureCase1,
  getGameParamsFixtureCase2,
  getGameParamsFixtureCase3,
  getGameParamsFixtureCase4,
  getGameParamsFixtureCase5,
  getGameParamsFixtureCase6,
  getGameParamsFixtureCase7,
  getGameParamsFixtureCase8,
} from './fixtures/getGamePoolFixture';

describe("Unit tests for getSetupGameResult.helper.ts", () => {
  test("Case 1: empty pools, game was rejected", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase1();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 2: only one poll has participants, game was rejected", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase2();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 2: only one poll has participants, game was rejected", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase3();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 4: end price is null, game was rejected", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase4();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 5: long, game was resolved", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase5();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 6: long and end price is between TP and SL, game was rejected", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase6();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 7: short, game was resolved", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase7();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });

  test("Case 8: short and end price is between TP and SL, game was rejected", () => {
    const { expectedResult, fixture } = getGameParamsFixtureCase8();

    const result = getSetupGameResult(fixture);

    expect(result).toStrictEqual(expectedResult);
  });
});
