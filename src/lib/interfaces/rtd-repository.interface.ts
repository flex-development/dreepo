import mingo from 'mingo'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import type { EntityDTO } from '../dto/entity.dto'
import type { AnyObject as Params, OneOrMany, PartialOr } from '../types-global'
import type { ProjectionCriteria } from '../types-mingo'
import type { IEntity } from './entity.interface'

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
  P extends Params = Params
> {
  readonly mingo: typeof mingo
  readonly model: RuntypeBase<E>
  readonly path: string
  readonly validate: boolean

  clear(): Promise<boolean>
  create(dto: EntityDTO<E>): Promise<E>
  delete(id: OneOrMany<E['id']>): Promise<typeof id>
  find(params?: P): Promise<PartialOr<E>[]>
  findByIds(ids: E['id'][], params?: P): Promise<PartialOr<E>[]>
  findOne(id: E['id'], params?: P): Promise<PartialOr<E> | null>
  findOneOrFail(id: E['id'], params?: P): Promise<PartialOr<E>>
  patch(id: E['id'], dto: Partial<EntityDTO<E>>, rfields?: string[]): Promise<E>
  save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<OneOrMany<E>>
  search(params?: P, projection?: ProjectionCriteria<E>): PartialOr<E>[]
}
