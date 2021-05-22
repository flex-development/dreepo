import type { IEntity } from '@/interfaces'
import type { EntityReadonlyProps } from '@/types'
import type { ObjectPath, PartialBy } from '@flex-development/tutils'

/**
 * @file Data Transfer Objects - EntityDTO
 * @module dto/EntityDTO
 */

/**
 * Base data transfer object for entities.
 *
 * @template E - Entity
 * @template P - Properties not required for data transfer
 */
export type EntityDTO<
  E extends IEntity = IEntity,
  P extends keyof E | ObjectPath<E> = EntityReadonlyProps
  // @ts-expect-error need to update type definition in @flex-development/tutils
> = PartialBy<E, P>
