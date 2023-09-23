import { ConfigManager } from "../../../engine/config/config-manager";

const config = {
  option: {
    obj: {
      number: 1,
      string: "test",
      date: new Date(2020, 0, 1, 0, 0, 0, 0),
      bool: true,
      array: ["test"],
    },
    arr: [{ value: "test" }],
  },
};

describe.each([
  { name: "JS Object", config },
  { name: "JSON string", config: JSON.stringify(config) },
])("tests for config manager with %s", (scenario) => {
  let configManager: ConfigManager<typeof config>;
  beforeAll(() => {
    configManager = new ConfigManager(scenario.config);
  });

  it("should retrieve object values", () => {
    const option = configManager.getObject("option.obj");
    expect(option).toStrictEqual({
      number: 1,
      string: "test",
      date: new Date(2020, 0, 1, 0, 0, 0, 0),
      bool: true,
      array: ["test"],
    });
  });

  it("should retrieve values from nested objects", () => {
    const objectValue = configManager.getValue("option.obj.string");
    expect(objectValue).toBe("test");
  });

  it("should retrieve values from nested arrays", () => {
    const arrayValue = configManager.getValue("option.obj.array[0]");
    expect(arrayValue).toBe("test");
  });

  it("should retrieve array values", () => {
    const option = configManager.getArray("option.arr");
    expect(option).toStrictEqual([{ value: "test" }]);
  });

  it("should retrieve string values", () => {
    const value = configManager.getString("option.obj.string");
    expect(value).toBe("test");
  });

  it("should retrieve number values", () => {
    const value = configManager.getInt("option.obj.number");
    expect(value).toBe(1);
  });

  it("should retrieve boolean values", () => {
    const value = configManager.getBool("option.obj.bool");
    expect(value).toBe(true);
  });

  it("should retrieve date values", () => {
    const value = configManager.getDate("option.obj.date");
    expect(value).toStrictEqual(new Date(2020, 0, 1, 0, 0, 0));
  });
});
