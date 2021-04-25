import type { EntityDTO } from '@/lib/dto/entity.dto'
import type { OneOrMany, PartialOr } from '@/lib/types'
import type { PlainObject as Params } from 'simplytyped'
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
  clear(): Promise<boolean>
  create(dto: EntityDTO<E>): Promise<E>
  delete(id: OneOrMany<E['id']>): Promise<typeof id>
  find(params?: P): Promise<PartialOr<E>[]>
  findByIds(ids: E['id'][], params?: P): Promise<PartialOr<E>[]>
  findOne(id: E['id'], params?: P): Promise<PartialOr<E> | null>
  findOneOrFail(id: E['id'], params?: P): Promise<PartialOr<E>>
  patch(id: E['id'], dto: Partial<EntityDTO<E>>, rfields?: string[]): Promise<E>
  query(params?: P): Promise<PartialOr<E>[]>
  save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<OneOrMany<E>>
}
