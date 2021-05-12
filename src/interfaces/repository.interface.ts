import type { EntityDTO } from '@/dto'
import type {
  EntityClass,
  EntityEnhanced,
  OneOrMany,
  PartialOr,
  RepoCache,
  RepoSearchParams
} from '@/types'
import type { Debugger } from 'debug'
import mingo from 'mingo'
import type { RawArray } from 'mingo/util'
import type { AggregationStages } from './aggregation-stages.interface'
import type { IEntity } from './entity.interface'
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
 * @template E - Entity
 * @template P - Repository search parameters
 */
export interface IRepository<
  E extends IEntity = IEntity,
  P extends RepoSearchParams<E> = RepoSearchParams<E>
> {
  readonly cache: RepoCache<E>
  readonly dbconn: IRepoDBConnection
  readonly logger: Debugger
  readonly mingo: typeof mingo
  readonly model: EntityClass<E>
  readonly options: RepoOptions
  readonly validator: IRepoValidator<E>

  aggregate(
    pipeline?: OneOrMany<AggregationStages<E>>
  ): PartialOr<EntityEnhanced<E>>[] | RawArray
  clear(): Promise<boolean>
  create(dto: EntityDTO<E>): Promise<E>
  delete(id: OneOrMany<E['id']>, should_exist?: boolean): Promise<typeof id>
  find(params?: P): PartialOr<E>[]
  findByIds(ids: E['id'][], params?: P): PartialOr<E>[]
  findOne(id: E['id'], params?: P): PartialOr<E> | null
  findOneOrFail(id: E['id'], params?: P): PartialOr<E>
  patch(id: E['id'], dto: Partial<EntityDTO<E>>, rfields?: string[]): Promise<E>
  refreshCache(): Promise<RepoCache<E>>
  save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<E[]>
}
