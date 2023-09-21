/** @type {import('ts-jest').JestConfigWithTsJest} */
const exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  modulePathIgnorePatterns: ["third-party", "dist"],
  moduleFileExtensions: ["ts", "js"],
};

export default exports;
