import type { EntityDTO } from '@/dto'
import type {
  EntityClass,
  EUID,
  RepoParsedUrlQuery,
  RepoSearchParams
} from '@/types'
import type { IMango } from '@flex-development/mango'
import type { OneOrMany, OrPartial } from '@flex-development/tutils'
import type { IEntity } from './entity.interface'
import type { RepoCache } from './repo-cache.interface'
import type { IRepoDBConnection } from './repo-db-connection.interface'
import type { RepoOptions } from './repo-options.interface'
import type { IRepoValidator } from './repo-validator.interface'

/**
 * @file Interface - IRepository
 * @module interfaces/Repository
 */

/**
 * `Repository` class interface.
 *
 * - https://github.com/flex-development/mango
 * - https://github.com/fox1t/qs-to-mongo
 * - https://github.com/kofrasa/mingo
 *
 * @template E - Entity
 * @template P - Repository search parameters (query criteria and options)
 * @template Q - Parsed URL query object
 */
export interface IRepository<
  E extends IEntity = IEntity,
  P extends RepoSearchParams<E> = RepoSearchParams<E>,
  Q extends RepoParsedUrlQuery<E> = RepoParsedUrlQuery<E>
> extends IMango<E, EUID, P, Q> {
  readonly cache: RepoCache<E>
  readonly dbconn: IRepoDBConnection
  readonly model: EntityClass<E>
  readonly options: RepoOptions<E>
  readonly validator: IRepoValidator<E>

  clear(): Promise<boolean>
  create(dto: EntityDTO<E>): Promise<E>
  delete(id: OneOrMany<E['id']>, should_exist?: boolean): Promise<typeof id>
  patch(id: E['id'], dto: Partial<EntityDTO<E>>, rfields?: string[]): Promise<E>
  refreshCache(): Promise<RepoCache<E>>
  save(dto: OneOrMany<OrPartial<EntityDTO<E>>>): Promise<E[]>
}
