import type { IEntity } from '../models/entity.model'
import type { EntityReadonlyProps, PartialBy } from '../types'

/**
 * @file Data Transfer Objects - EntityDTO
 * @module lib/dto/EntityDTO
 */

/**
 * Base data transfer object for entities.
 *
 * @template E - Entity shape
 * @template P - Properties not required for data transfer
 */
export type EntityDTO<
  E extends IEntity = IEntity,
  P extends keyof E = EntityReadonlyProps
> = PartialBy<E, P>
