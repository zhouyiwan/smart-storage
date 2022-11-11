// const { defaults: tsjPreset } = require('ts-jest/presets')

const defaults = {
  collectCoverage: true,
}

const NORMAL_TEST_FOLDERS = ['utils']

const tsTestFolderPath = (folderName) =>
  `<rootDir>/test/${folderName}/**/*.{ts,tsx}`

const tsStandardConfig = {
  ...defaults,
  displayName: 'ReactDOM 18 (Shim)',
  preset: 'ts-jest',
  testMatch: NORMAL_TEST_FOLDERS.map(tsTestFolderPath),
}

module.exports = {
  projects: [tsStandardConfig],
}
