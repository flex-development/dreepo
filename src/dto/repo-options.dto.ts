import type { RepoOptions } from '@/interfaces'

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
  mingo?: Partial<RepoOptions['mingo']>

  /**
   * `RepoSearchParamsBuilder` client options.
   */
  qbuilder?: RepoOptions['qbuilder']

  /**
   * Repository Validation API options.
   *
   * @default { enabled: true }
   */
  validation?: RepoOptions['validation']
}
