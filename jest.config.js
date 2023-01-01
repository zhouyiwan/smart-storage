// const { defaults: tsjPreset } = require('ts-jest/presets')

const defaults = {
  collectCoverage: true,
}

const tsStandardConfig = {
  ...defaults,
  displayName: 'smart-web-storage',
  preset: 'ts-jest',
  testMatch: [`<rootDir>/test/**/*.test.{ts,tsx}`],
}

module.exports = {
  projects: [tsStandardConfig],
}
