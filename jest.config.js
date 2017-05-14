var semver = require('semver');

function getSupportedTypescriptTarget() {
  var nodeVersion = process.versions.node;

  if (semver.gt(nodeVersion, '7.6.0')) {
    return 'es2017'
  } else if (semver.gt(nodeVersion, '7.0.0')) {
    return 'es2016';
  } else if (semver.gt(nodeVersion, '6.0.0')) {
    return 'es2015';
  } else if (semver.gt(nodeVersion, '4.0.0')) {
    return 'es5';
  } else {
    return 'es3';
  }
}

module.exports = {
  mapCoverage: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '.ts': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testMatch: [
    '**/__tests__/**/*.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/(node_modules|dist)',
    '_\\w*.\\w+$'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  globals: {
    __TS_CONFIG__: {
      target: getSupportedTypescriptTarget(),
      module: 'commonjs'
    }
  }
};
