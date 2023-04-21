/** @type {import('ts-jest').JestConfigWithTsJest} */
const exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["third-party", "dist"],
};

export default exports;
