module.exports = {
  mapCoverage: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '.ts': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testMatch: ['**/__tests__/**/*.ts'],
  testPathIgnorePatterns: ['<rootDir>/(node_modules|dist)', '_\\w*.\\w+$'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  globals: {
    'ts-jest': {
      tsConfigFile: './tsconfig.test.json'
    },
  },
};
