import type { EUID } from '@/types'
import type { MangoOptions } from '@flex-development/mango'
import type { IEntity } from './entity.interface'
import type { RepoValidatorOptions } from './repo-validator-options.interface'

/**
 * @file Interface - RepoOptions
 * @module interfaces/RepoOptions
 */

/**
 * Options accepted by the `Repository` class.
 *
 * @template E - Entity
 */
export interface RepoOptions<E extends IEntity = IEntity>
  // @ts-expect-error need to update type definition in @flex-development/mango
  extends MangoOptions<E, EUID> {
  /**
   * Repository Validation API options.
   *
   * @default {}
   */
  validation: RepoValidatorOptions
}
