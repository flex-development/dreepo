import type { Options } from 'mingo/core'

/**
 * @file Interface - MingoOptions
 * @module lib/interfaces/MingoOptions
 * @see https://github.com/kofrasa/mingo/blob/master/src/core.ts
 */

/**
 * [Mingo][1] options used in this project.
 *
 * [1]: https://github.com/kofrasa/mingo
 */
export interface MingoOptions extends Omit<Options, 'idKey'> {
  idKey: 'id'
}
