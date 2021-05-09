import type { MingoOptions, RepoValidatorOptions } from '@/interfaces'

/**
 * @file Data Transfer Objects - RepoOptionsDTO
 * @module dto/RepoOptionsDTO
 */

/**
 * Options accepted by the `Repository` class constructor.
 */
export interface RepoOptionsDTO {
  /**
   * Aggregation and query client options.
   *
   * See: https://github.com/kofrasa/mingo
   */
  mingo?: Partial<MingoOptions>

  /**
   * Repository Validation API options.
   *
   * @default {}
   */
  validation?: RepoValidatorOptions
}
