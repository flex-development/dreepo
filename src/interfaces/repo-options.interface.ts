import type { MingoOptions } from './mingo-options.interface'
import type { RepoValidatorOptions } from './repo-validator-options.interface'

/**
 * @file Interface - RepoOptions
 * @module interfaces/RepoOptions
 */

/**
 * Options accepted by the `Repository` class.
 */
export interface RepoOptions {
  /**
   * Aggregation and query client options.
   *
   * See: https://github.com/kofrasa/mingo
   */
  mingo: MingoOptions

  /**
   * Repository Validation API options.
   *
   * @default {}
   */
  validation: RepoValidatorOptions
}
