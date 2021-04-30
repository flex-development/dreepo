import type { Debugger } from 'debug'
import mingo from 'mingo'
import type { RawArray, RawObject } from 'mingo/util'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import type { EntityDTO } from '../dto/entity.dto'
import type { IEntity } from '../models/entity.model'
import type { OneOrMany, PartialOr } from '../types-global'
import type {
  EntityEnhanced,
  QueryParams,
  RepoCache,
  RepoHttpClient
} from '../types-repository'
import type { AggregationStages } from './aggregration-stages.interface'
import type { DBRequestConfig } from './db-request-config.interface'
import type { MingoOptions } from './mingo-options.interface'

/**
 * @file Interface - IRTDRepository
 * @module lib/interfaces/RTDRepository
 */

/**
 * Repository API interface for Firebase Realtime Database.
 *
 * @template E - Entity
 * @template P - Query parameters
 */
export interface IRTDRepository<
  E extends IEntity = IEntity,
  P extends QueryParams<E> = QueryParams<E>
> {
  readonly DATABASE_URL: string
  readonly cache: RepoCache<E>
  readonly http: RepoHttpClient
  readonly logger: Debugger
  readonly mingo: typeof mingo
  readonly mopts: MingoOptions
  readonly model: RuntypeBase<E>
  readonly path: string
  readonly validate_enabled: boolean

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
  request<T = any>(config?: DBRequestConfig): Promise<T>
  save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<E[]>
  validate<V extends unknown = RawObject>(value?: V): E | V
}
