import type { EntityClass } from '@/types'
import type { PlainObject } from '@flex-development/exceptions/types'
import type { transformAndValidate } from 'class-transformer-validator'
import type { IEntity } from './entity.interface'
import type { RepoValidatorOptions } from './repo-validator-options.interface'

/**
 * @file Interface - IRepoValidator
 * @module interfaces/IRepoValidator
 */

/**
 * `RepoValidator` mixin class interface.
 *
 * @template E - Entity
 */
export interface IRepoValidator<E extends IEntity = IEntity> {
  readonly enabled: boolean
  readonly model: EntityClass<E>
  readonly tvo: Omit<RepoValidatorOptions, 'enabled'>
  readonly validator: typeof transformAndValidate

  check<V extends unknown = PlainObject>(value?: V): Promise<E | V>
}
