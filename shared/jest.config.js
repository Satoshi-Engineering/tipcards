/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns : [
  ],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/$1',
  },
}
