import type { RepoRoot } from '@/types'
import type { MangoCache } from '@flex-development/mango/interfaces'
import type { IEntity } from './entity.interface'

/**
 * @file Interface - RepoCache
 * @module interfaces/RepoCache
 */

/**
 * Repository data cache.
 *
 * @template E - Entity
 */
export interface RepoCache<E extends IEntity> extends MangoCache<E> {
  root: RepoRoot<E>
}
