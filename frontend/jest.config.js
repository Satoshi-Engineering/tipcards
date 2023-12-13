/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns : [
    '.nuxt',
    '.output',
    'node_modules',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@backend/(.*)$': '<rootDir>/../backend/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
}
