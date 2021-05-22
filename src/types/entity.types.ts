import type { IEntity } from '@/interfaces'
import type { DocumentPartial, DocumentPath } from '@flex-development/mango'
import type { ClassType } from 'class-transformer-validator'

/**
 * @file Type Definitions - Entities
 * @module types/entity
 */

/**
 * Name of field used as unique identifier for entities.
 */
export type EUID = 'id'

/**
 * Entity constructor function.
 *
 * @template E - Entity
 */
export type EntityClass<E extends IEntity = IEntity> = ClassType<E>

/**
 * Response that includes all attributes of an entity or a subset.
 *
 * Even when a subset of attributes are requested, a partial `Entity` response
 * will always include the `id` field.
 *
 * @template E - Entity
 */
export type EntityPartial<E extends IEntity = IEntity> = DocumentPartial<
  // @ts-expect-error need to update type definition in @flex-development/mango
  E,
  EUID
>

/**
 * Type representing a nested or top level entity key.
 *
 * @template E - Entity
 */
export type EntityPath<E extends IEntity = IEntity> = DocumentPath<E>

/**
 * Readonly properties of all entities.
 *
 * The `created_at` and `id` fields cannot be overwritten; whereas `updated_at`
 * can only be updated internally by the `EntityRepository` class.
 */
export type EntityReadonlyProps = 'created_at' | 'id' | 'updated_at'
