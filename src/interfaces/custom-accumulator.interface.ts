import type { RawObject } from 'mingo/util'

/**
 * @file Interface - CustomAccumulator
 * @module interfaces/CustomAccumulator
 */

/**
 * Defines a custom [accumulator operator][1].
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/aggregation/accumulator
 */
export interface CustomAccumulator {
  /**
   * Arguments passed to the `accumulate` function.
   *
   * You can use `accumulateArgs` to specify what field value(s) to pass to the
   * accumulate function.
   */
  accumulateArgs: any[]

  /**
   * Function used to accumulate entities.
   *
   * The `accumulate` function receives its arguments from the current state and
   * `accumulateArgs` array expression.
   *
   * The result of the accumulate function becomes the new state.
   */
  accumulate: {
    (
      state: any,
      ...args: CustomAccumulator['accumulateArgs']
    ): CustomAccumulatorState
  }

  /**
   * Function used to update the result of the accumulation.
   */
  finalize: {
    (state: CustomAccumulatorState): CustomAccumulatorState | RawObject
  }

  /**
   * Arguments passed to the `init` function.
   */
  initArgs?: any[]

  /**
   * Function used to initialize the state. The `init` function receives its
   * arguments from the `initArgs` array expression.
   */
  init: { (...args: NonNullable<CustomAccumulator['initArgs']>): any }

  /**
   * Function used to merge two internal states.
   */
  merge: { (...args: CustomAccumulatorState[]): CustomAccumulatorState }

  /**
   * The language used in the `$accumulator` code.
   */
  lang: 'js'
}

export type CustomAccumulatorState = ReturnType<CustomAccumulator['init']>
