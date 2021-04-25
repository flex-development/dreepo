import type { AxiosRequestConfig } from 'axios'
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
 * Type representing a `number` or `string`.
 */
export type NumberString = number | string

/**
 * Type that accepts one piece of data or an array of data.
 */
export type OneOrMany<T = ANY> = T | Array<T>

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

/**
 * Type allowing all properties of T or some properties of T.
 */
export type PartialOr<T = PlainObject> = T | Partial<T>

/**
 * HTTP client used to make requests to the Firebase Database REST API.
 */
export type RepoHttpClient<T = any> = {
  (config: AxiosRequestConfig): Promise<{ data: T }>
}
