import { IntervalParsingFailedError } from "../../../utils/errors";
import { arrayFromInterval } from "../../../utils/maths/interval";

describe("arrayFromInterval", () => {
  it("should return the expected array for successful cases", () => {
    const cases = [
      { input: "[1,4]", output: [1, 2, 3, 4] },
      { input: "[1..4]", output: [1, 2, 3, 4] },
      { input: "(1,4)", output: [2, 3] },
      { input: "(1..4)", output: [2, 3] },
    ];

    cases.forEach((c) => expect(arrayFromInterval(c.input)).toStrictEqual(c.output));
  });

  it("should return the expected array for successful reverse cases", () => {
    const cases = [
      { input: "[4,1]", output: [4, 3, 2, 1] },
      { input: "[4..1]", output: [4, 3, 2, 1] },
      { input: "(4,1)", output: [3, 2] },
      { input: "(4..1)", output: [3, 2] },
    ];

    cases.forEach((c) => expect(arrayFromInterval(c.input)).toStrictEqual(c.output));
  });

  it("should throw IntervalParsingFailedError for invalid cases", () => {
    const cases = ["]1,2]", "[1,2[", "[]", "[1,1]", "(1,1)", "[1/2]"];
    cases.forEach((c) => expect(() => arrayFromInterval(c)).toThrow(IntervalParsingFailedError));
  });
});
