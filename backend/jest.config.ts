import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.module.ts',
    '!src/**/main.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.decorator.ts',
    '!src/**/*.guard.ts',
    '!src/**/*.strategy.ts',
    '!src/data-source.ts',
  ],
  coverageDirectory: './test/coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
