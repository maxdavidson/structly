module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/(node_modules|dist)', '_\\w*.\\w+$'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/_*'],
  globals: {
    'ts-jest': {
      target: 'es2015',
    },
  },
};
