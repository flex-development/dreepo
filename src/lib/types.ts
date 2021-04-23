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
