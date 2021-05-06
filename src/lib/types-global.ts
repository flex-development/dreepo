import type { RawObject } from 'mingo/util'

/**
 * @file Type Definitions - Globals
 * @module lib/types
 */

/**
 * Type representing any value.
 */
export type ANY = any

/**
 * Type representing any empty object.
 */
export type EmptyObject = Record<never, never>

/**
 * Type representing any JSON object.
 */
export type JSONObject = Record<string, JSONValue>

/**
 * Types of JSON data values.
 */
export type JSONValue = OneOrMany<NullishPrimitive | RawObject>

/**
 * Type representing a `number` or `string`.
 */
export type NumberString = number | string

/**
 * Type representing any boolean that can also be null.
 */
export type NullishBoolean = boolean | null

/**
 * Type representing any number that can also be null.
 */
export type NullishNumber = number | null

/**
 * Type representing any defined `Primitive` that can also be null.
 */
export type NullishPrimitive = Primitive | null

/**
 * Type representing any string that can also be null.
 */
export type NullishString = string | null

/**
 * Type representing a deeply nested or top level object key.
 *
 * @template T - Object type
 *
 * See: https://github.com/ghoullier/awesome-template-literal-types
 */
export type ObjectPath<T> = ObjectPathNT<T> extends string | keyof T
  ? ObjectPathNT<T>
  : keyof T

/**
 * Type representing a deeply nested object key or `never` if the key in
 * question does on exist on {@template T}.
 *
 * @template T - Object type
 * @template K - Nested object key
 *
 * - https://github.com/ghoullier/awesome-template-literal-types#dot-notation-string-type-safe
 */
export type ObjectPathN<T, K extends keyof T> = K extends string
  ? T[K] extends RawObject
    ?
        | `${K}.${ObjectPathN<T[K], Exclude<keyof T[K], keyof any[]>> & string}`
        | `${K}.${Exclude<keyof T[K], keyof any[]> & string}`
    : never
  : never

/**
 * Type representing a deeply nested object key, or top level key if the key in
 * question does on exist on {@template T}.
 *
 * @template T - Object type
 *
 * - https://github.com/ghoullier/awesome-template-literal-types#dot-notation-string-type-safe
 */
export type ObjectPathNT<T> = ObjectPathN<T, keyof T> | keyof T

/**
 * Type representing an object value.
 *
 * @template T - Object type
 * @template P - Deeply nested or top level object path
 *
 * - https://github.com/ghoullier/awesome-template-literal-types#dot-notation-string-type-safe
 */
export type ObjectPathValue<
  T,
  P extends ObjectPath<T>
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends ObjectPath<T[Key]>
      ? ObjectPathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never

/**
 * Type that accepts one piece of data or an array of data.
 *
 * @template T - Data
 */
export type OneOrMany<T = ANY> = T | Array<T>

/**
 * Represents data returned by a function, or the return type of a function that
 * never returns a value because an error was thrown.
 *
 * @template T - Return value
 */
export type OrNever<T = any> = T | never

/**
 * Type representing an asynchronous or synchronous value.
 *
 * @template T - type
 */
export type OrPromise<T = any> = T | Promise<T>

/**
 * Omit certain fields while making others optional.
 *
 * @template T - Object type
 * @template K - Object fields (top level) to omit
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make certain fields required while making others required.
 *
 * @template T - Object type
 * @template K - Object fields (top level) to pick
 */
export type PartialByRequired<T, K extends keyof T> = Pick<T, K> &
  Partial<Omit<T, K>>

/**
 * Type allowing all properties of T or some properties of T.
 *
 * @template T - Object type
 */
export type PartialOr<T = RawObject> = T | Partial<T>

/**
 * Type capturing defined primitive value types.
 */
export type Primitive = boolean | number | string
