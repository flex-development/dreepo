import type { RepoParsedUrlQuery, RepoSearchParams } from '@/types'
import type {
  IMangoRepositoryAsync,
  MangoCacheRepo
} from '@flex-development/mango/interfaces'
import type { DUID, RepoRoot } from '@flex-development/mango/types'
import type { IEntity } from './entity.interface'
import type { IRepoDBConnection } from './repo-db-connection.interface'

/**
 * @file Interface - IRepository
 * @module interfaces/Repository
 */

/**
 * `Repository` class interface.
 *
 * - https://github.com/flex-development/mango#mango-repository
 *
 * @template E - Entity
 * @template P - Repository search parameters (query criteria and options)
 * @template Q - Parsed URL query object
 *
 * @extends IMangoRepositoryAsync
 */
export interface IRepository<
  E extends IEntity = IEntity,
  P extends RepoSearchParams<E> = RepoSearchParams<E>,
  Q extends RepoParsedUrlQuery<E> = RepoParsedUrlQuery<E>
> extends IMangoRepositoryAsync<E, DUID, P, Q> {
  readonly dbconn: IRepoDBConnection

  cacheInit(): Promise<MangoCacheRepo<E>>
  cacheSync(): Promise<RepoRoot<E>>
}
