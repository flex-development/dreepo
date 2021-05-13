import type { EntityDTO } from '@/dto'
import type {
  EntityClass,
  EntityEnhanced,
  OneOrMany,
  PartialEntity,
  PartialOr,
  RepoCache,
  RepoParsedUrlQuery,
  RepoSearchParams
} from '@/types'
import type { Debugger } from 'debug'
import mingo from 'mingo'
import type { RawArray } from 'mingo/util'
import type { AggregationStages } from './aggregation-stages.interface'
import type { IEntity } from './entity.interface'
import type { IRepoDBConnection } from './repo-db-connection.interface'
import type { RepoOptions } from './repo-options.interface'
import type { IRepoSearchParamsBuilder } from './repo-search-params-builder.interface'
import type { IRepoValidator } from './repo-validator.interface'

/**
 * @file Interface - IRepository
 * @module interfaces/Repository
 */

/**
 * `Repository` class interface.
 *
 * - https://github.com/fox1t/qs-to-mongo
 * - https://github.com/kofrasa/mingo
 *
 * @template E - Entity
 * @template P - Repository search parameters
 * @template Q - URL query parameters
 */
export interface IRepository<
  E extends IEntity = IEntity,
  P extends RepoSearchParams<E> = RepoSearchParams<E>,
  Q extends RepoParsedUrlQuery<E> = RepoParsedUrlQuery<E>
> {
  readonly cache: RepoCache<E>
  readonly dbconn: IRepoDBConnection
  readonly logger: Debugger
  readonly mingo: typeof mingo
  readonly model: EntityClass<E>
  readonly options: RepoOptions
  readonly qbuilder: IRepoSearchParamsBuilder<E>
  readonly validator: IRepoValidator<E>

  aggregate(
    pipeline?: OneOrMany<AggregationStages<E>>
  ): PartialOr<EntityEnhanced<E>>[] | RawArray
  clear(): Promise<boolean>
  create(dto: EntityDTO<E>): Promise<E>
  delete(id: OneOrMany<E['id']>, should_exist?: boolean): Promise<typeof id>
  find(params?: P): PartialEntity<E>[]
  findByIds(ids?: E['id'][], params?: P): PartialEntity<E>[]
  findOne(id: E['id'], params?: P): PartialEntity<E> | null
  findOneOrFail(id: E['id'], params?: P): PartialEntity<E>
  patch(id: E['id'], dto: Partial<EntityDTO<E>>, rfields?: string[]): Promise<E>
  query(query?: Q | string): PartialEntity<E>[]
  queryByIds(ids?: E['id'][], query?: Q | string): PartialEntity<E>[]
  queryOne(id: E['id'], query?: Q | string): PartialEntity<E> | null
  queryOneOrFail(id: E['id'], query?: Q | string): PartialEntity<E>
  refreshCache(): Promise<RepoCache<E>>
  save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<E[]>
}
