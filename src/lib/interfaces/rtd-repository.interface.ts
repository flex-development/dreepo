import mingo from 'mingo'
import type { RawArray } from 'mingo/util'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import type { EntityDTO } from '../dto/entity.dto'
import type { OneOrMany, PartialOr } from '../types-global'
import type { EntityEnhanced, QueryParams } from '../types-repository'
import type { AggregationStages } from './aggregration-stages.interface'
import type { IEntity } from './entity.interface'
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
  readonly mingo: typeof mingo
  readonly mopts: MingoOptions
  readonly model: RuntypeBase<E>
  readonly path: string
  readonly validate: boolean

  aggregate(
    pipeline?: OneOrMany<AggregationStages<E>>
  ): PartialOr<EntityEnhanced<E>>[] | RawArray
  clear(): Promise<boolean>
  create(dto: EntityDTO<E>): Promise<E>
  delete(id: OneOrMany<E['id']>): Promise<typeof id>
  find(params?: P): PartialOr<E>[]
  findByIds(ids: E['id'][], params?: P): Promise<PartialOr<E>[]>
  findOne(id: E['id'], params?: P): Promise<PartialOr<E> | null>
  findOneOrFail(id: E['id'], params?: P): Promise<PartialOr<E>>
  patch(id: E['id'], dto: Partial<EntityDTO<E>>, rfields?: string[]): Promise<E>
  save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<OneOrMany<E>>
}
