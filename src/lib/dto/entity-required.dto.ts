import type { IEntity } from '../interfaces/entity.interface'
import type { EntityReadonlyProps, PartialByRequired } from '../types'

/**
 * @file Global DTOs - EntityDTOR
 * @module lib/dto/EntityDTOR
 */

/**
 * Base data transfer object with required properties for entities.
 *
 * @template E - Entity shape
 * @template P - Required properties
 */
export type EntityDTOR<
  E extends IEntity = IEntity,
  P extends keyof E = EntityReadonlyProps
> = PartialByRequired<E, P>
