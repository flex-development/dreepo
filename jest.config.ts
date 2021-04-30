import type { Config } from '@jest/types'
import baseConfig from './jest.config.base'
import pkg from './package.json'

/**
 * @file Jest Root Configuration
 * @see https://jestjs.io/docs/next/configuration
 */

const prefix = '<rootDir>/'

const config: Config.InitialOptions = {
  ...baseConfig,
  displayName: pkg.name.split('@flex-development/')[1],
  roots: [`${prefix.slice(0, prefix.length - 1)}`]
}

export default config
