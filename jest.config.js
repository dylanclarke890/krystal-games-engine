/** @type {import('ts-jest').JestConfigWithTsJest} */
const exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["older", "dist"],
  moduleFileExtensions: ["ts", "js"],
};

export default exports;
