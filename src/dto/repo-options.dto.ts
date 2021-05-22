import type { IEntity, RepoOptions } from '@/interfaces'
import type { EUID } from '@/types'
import type { MangoOptionsDTO } from '@flex-development/mango/dto'

/**
 * @file Data Transfer Objects - RepoOptionsDTO
 * @module dto/RepoOptionsDTO
 */

/**
 * Options accepted by the `Repository` class constructor.
 *
 * @template E - Entity
 */
export interface RepoOptionsDTO<E extends IEntity = IEntity>
  extends MangoOptionsDTO<E, EUID> {
  /**
   * Repository Validation API options.
   *
   * @default { enabled: true }
   */
  validation?: RepoOptions<E>['validation']
}
