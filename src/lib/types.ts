import { ExceptionStatus } from '@rtd-repos/lib/enums'
import type { PlainObject } from 'simplytyped'

/**
 * @file Globals - Type Definitions
 * @module lib/types
 */

/**
 * Type representing any value.
 */
export type ANY = any

/**
 * Readonly properties of all entities.
 *
 * The `created_at` and `id` fields cannot be overwritten; whereas `updated_at`
 * can only be updated internally by the `EntityRepository` class.
 */
export type EntityReadonlyProps = 'created_at' | 'id' | 'updated_at'

/**
 * Shape of `ExceptionJSON` `errors` property.
 */
export type ExceptionErrors = PlainObject | (PlainObject | string)[] | null

/**
 * Possible exception names.
 */
export type ExceptionName = keyof typeof ExceptionStatus

/**
 * Type representing an empty object.
 */
export type EmptyObject = Record<never, never>

/**
 * Type representing an empty string.
 */
export type EmptyString = '' | ' '

/**
 * Base data transfer object for entities.
 */
export type EntityDTO<
  E extends PlainObject = PlainObject,
  P extends string = EntityReadonlyProps
> = PartialBy<E, P>

/**
 * Base data transfer object with required properties for entities.
 */
export type EntityDTOR<
  E extends PlainObject = PlainObject,
  P extends string = EntityReadonlyProps
> = PartialByRequired<E, P>

/**
 * Type representing a `number` or `string`.
 */
export type NumberString = number | string

/**
 * Represents data returned by a function, or the return type of a function that
 * never returns a value because an error was thrown.
 */
export type OrNever<T = any> = T | never

/**
 * Type representing an asynchronous or synchronous value.
 */
export type OrPromise<T = any> = T | Promise<T>

/**
 * Omit certain fields while making others optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make certain fields required while making others required.
 */
export type PartialByRequired<T, K extends keyof T> = Pick<T, K> &
  Partial<Omit<T, K>>
