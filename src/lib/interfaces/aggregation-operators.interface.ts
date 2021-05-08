import { BSONTypeAlias } from '../enums/bson-type-alias.enum'
import { BSONTypeCode } from '../enums/bson-type-code.enum'
import type { JSONValue } from '../types-global'
import type { Expression } from '../types-mingo'
import type { AccumulatorOperators } from './accumulator-operators.interface'
import { CustomAccumulator } from './custom-accumulator.interface'
import type { IEntity } from './entity.interface'

/**
 * @file Interface - AggregationOperators
 * @module lib/interfaces/AggregationOperators
 */

/**
 * [Aggregation Pipeline Operators][1].
 *
 * The only operators documented are those loaded by {@module config/mingo}.
 *
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/aggregation/#alphabetical-listing-of-expression-operators
 */
export interface AggregationOperators<E extends IEntity = IEntity>
  extends AccumulatorOperators<E> {
  /**
   * Support package users loading additional operators.
   *
   * @todo Ensure index signature begins with dollar (`$`) sign
   */
  [x: string]: Expression<E> | CustomAccumulator | undefined

  /**
   * Returns the absolute value of a number.
   *
   * Can be any valid [expression][1] as long as it resolves to a number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/abs
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $abs?: Expression<E>

  /**
   * Adds numbers together or adds numbers and a date.
   *
   * If one of the arguments is a date, `$add` treats the other arguments as
   * milliseconds to add to the date.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * either all numbers or to numbers and a date.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/add
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $add?: Expression<E>[]

  /**
   * Evaluates an array as a set and returns `true` if no element in the array
   * is `false`. Otherwise, returns `false`.
   *
   * An empty array returns `true`.
   *
   * Each item can be any valid [expression][1] as long as it resolves to an
   * array, separate from the outer array that denotes the argument list.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/allElementsTrue
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $allElementsTrue?: Expression<E>[]

  /**
   * Evaluates one or more expressions and returns `true` if all of the
   * expressions are `true` or if evoked with no argument expressions.
   * Otherwise, returns `false`.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/and
   */
  $and?: Expression<E>[]

  /**
   * Evaluates an array as a set and returns `true` if any of the elements are
   * `true` and `false` otherwise. An empty array returns `false`.
   *
   * Each item can be any valid [expression][1] as long as it resolves to an
   * array, separate from the outer array that denotes the argument list.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/anyElementTrue
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $anyElementTrue?: Expression<E>[]

  /**
   * Returns the element at the specified array index.
   *
   * The first item in the `$arrayElemAt` expression should be an array or an
   * [expression][1] that resolves to an array. The second should be an integer
   * or an [expression][1] that resolves to an integer.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/arrayElemAt
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $arrayElemAt?: [Expression<E>, Expression<E>]

  /**
   * Converts an array into a single object.
   *
   * Can be any valid [expression][1] as long as it resolves to an array of
   * two-element arrays or array of documents that contains "k" and "v" fields.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/arrayToObject
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $arrayToObject?:
    | [[string, any], [string, any]]
    | Record<'k' | 'v', any>[]
    | Expression<E>

  /**
   * Returns the smallest integer greater than or equal to the specified number.
   *
   * Can be any valid [expression][1] as long as it resolves to a number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/ceil
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $ceil?: Expression<E>

  /**
   * Compares two values and returns:
   *
   * - `-1`: if the first value is less than the second
   * - `1`: if the first value is greater than the second
   * - `0`: if the two values are equivalent
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for values of different types.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/cmp
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $cmp?: [Expression<E>, Expression<E>]

  /**
   * Concatenates strings and returns the concatenated string.
   *
   * Each item can be any valid [expression][1] as long as it resolves to a
   * string.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/concat
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $concat?: Expression<E>[]

  /**
   * Converts a value to a specified type.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/convert
   */
  $convert?: {
    input: Expression<E>
    onError?: Expression<E>
    onNull?: Expression<E>
    to: BSONTypeAlias | BSONTypeCode
  }

  /**
   * Concatenates arrays to return the concatenated array.
   *
   * Each item can be any valid [expression][1] as long as it resolves to an
   * array, separate from the outer array that denotes the argument list.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/concatArrays
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $concatArrays?: Expression<E>[][]

  /**
   * Evaluates a boolean expression to return one of the two specified return
   * expressions.
   *
   * Each item can be any valid [expression][1].
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/cond
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $cond?:
    | { if: Expression<E>; then: Expression<E>; else: Expression<E> }
    | [Expression<E>, Expression<E>, Expression<E>]

  /**
   * Converts a date/time string to a date object.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/dateFromString
   */
  $dateFromString?: {
    dateString: Expression<E>
    format?: string
    onError?: Expression<E>
    onNull?: Expression<E>
    timezone?: string
  }

  /**
   * Converts a date object to a string according to a user-specified format.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/dateToString
   */
  $dateToString?: {
    date: Expression<E>
    format: string
    onNull?: Expression<E>
    timezone?: string
  }

  /**
   * Divides one number by another and returns the result.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/divide
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $divide?: [Expression<E>, Expression<E>]

  /**
   * Compares two values and returns:
   *
   * - `false`: values are **not** equivalent
   * - `true`: values are equivalent
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for values of different types.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/eq
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $eq?: [Expression<E>, Expression<E>]

  /**
   * Raises Euler's number (`e`) to the specified exponent and returns the
   * result.
   *
   * Can be any valid [expression][1] as long as it resolves to a number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/exp
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $exp?: Expression<E>

  /**
   * Selects a subset of an array to return based on the specified condition.
   * Returns an array with only those elements that match the condition. The
   * returned elements are in the original order.
   *
   * The `input` field can be any valid [expression][1] as long as it resolves
   * to an array. The `cond` field can be any valid [expression][1] as long as
   * it resolves to a boolean.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/filter
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $filter?: { as?: string; cond: Expression<E>; input: Expression<E> }

  /**
   * Returns the largest integer less than or equal to the specified number.
   *
   * Can be any valid [expression][1] as long as it resolves to a number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/floor
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $floor?: Expression<E>

  /**
   * Compares two values and returns:
   *
   * - `false`: first value is *less than or equal to* the second value
   * - `true`: first value is *greater than* the second value
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for values of different types.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/gt
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $gt?: [Expression<E>, Expression<E>]

  /**
   * Compares two values and returns:
   *
   * - `false`: first value is *less than* the second value
   * - `true`: first value is *greater than or equal to* the second value
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for values of different types.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/gte
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $gte?: [Expression<E>, Expression<E>]

  /**
   * Evaluates an expression and returns the value of the expression if the
   * expression evaluates to a non-null value.
   *
   * If the expression evaluates to a `null` value, including instances of
   * `undefined` values or missing fields, returns the value of the replacement
   * expression.
   *
   * Each item can be any valid [expression][1].
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/ifNull
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $ifNull?: [Expression<E>, Expression<E>]

  /**
   * Returns a boolean indicating whether a specified value is in an array.
   *
   * Each item can be any valid [expression][1] as long as the second item
   * resolves to an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/in
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $in?: [Expression<E>, Expression<E>]

  /**
   * Searches an array for an occurrence of a specified value and returns the
   * array index (zero-based) of the first occurrence. If the value is not
   * found, returns `-1`.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/indexOfArray
   */
  $indexOfArray?:
    | [Expression<E>, Expression<E>, Expression<E>, Expression<E>]
    | [Expression<E>, Expression<E>]

  /**
   * Determines if the operand is an array. Returns a boolean.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/isArray
   */
  $isArray?: Expression<E>

  /**
   * Binds [variables][1] for use in the specified expression, and returns the
   * result of the expression.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/let
   *
   * [1]: https://docs.mongodb.com/manual/reference/aggregation-variables/
   */
  $let?: { in: Expression<E>; vars: Record<string, Expression<E>> }

  /**
   * Returns a value without parsing. Use for values that the aggregation
   * pipeline may interpret as an [expression][1].
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/literal
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $literal?: JSONValue

  /**
   * Calculates the natural logarithm ln (`log e`) of a number and returns the
   * result as a double.
   *
   * Can be any valid [expression][1] as long as it resolves to a non-negative
   * number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/ln
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $ln?: Expression<E>

  /**
   * Calculates the log of a number in the specified base and returns the result
   * as a double.
   *
   * Each item can be any valid [expression][1] as long as the first item
   * resolves to a non-negative number and the second resolves to a positive
   * number greater than 1.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/log
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $log?: [Expression<E>, Expression<E>]

  /**
   * Calculates the log base 10 of a number and returns the result as a double.
   *
   * Can be any valid [expression][1] as long as it resolves to a non-negative
   * number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/log10
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $log10?: Expression<E>

  /**
   * Compares two values and returns:
   *
   * - `false`: first value is *greater than or equal to* the second value
   * - `true`: first value is *less than* the second value
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for values of different types.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/lt
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $lt?: [Expression<E>, Expression<E>]

  /**
   * Compares two values and returns:
   *
   * - `false`: first value is *greater than* the second value
   * - `true`: first value is *less than or equal to* the second value
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for values of different types.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/lte
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $lte?: [Expression<E>, Expression<E>]

  /**
   * Returns a document created by combining the input documents for each group.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/mergeObjects
   */
  $mergeObjects?: Expression<E>[]

  /**
   * Applies an expression to each item in an array and returns an array with
   * the applied results.
   *
   * The `input` field can be any valid [expression][1] as long as it resolves
   * to an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/map
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $map?: { as?: string; input: Expression<E>; in: Expression<E> }

  /**
   * Divides one number by another and returns the remainder.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/mod
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $mod?: [Expression<E>, Expression<E>]

  /**
   * Multiplies numbers together and returns the result.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/multiply
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $multiply?: Expression<E>[]

  /**
   * Compares two values and returns:
   *
   * - `false`: values are equivalent
   * - `true`: values are **not** equivalent
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for values of different types.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/ne
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   */
  $ne?: [Expression<E>, Expression<E>]

  /**
   * Returns a boolean indicating whether a specified value is NOT in an array.
   *
   * Each item can be any valid [expression][1] as long as the second item
   * resolves to an array.
   *
   * NOTE: This expression operator is missing from the documentation.
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $nin?: [Expression<E>, Expression<E>]

  /**
   * Evaluates a boolean and returns the opposite boolean value.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/not
   */
  $not?: Expression<E>[]

  /**
   * Converts a document to an array.
   *
   * The return array contains an element for each field/value pair in the
   * original entity. Each element in the return array is a document that
   * contains two fields k and v:
   *
   * - `k`: field name in the original document
   * - `v`: value of the field in the original document
   *
   * Can be any valid [expression][1] as long as it resolves to an object.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/objectToArray
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $objectToArray?: Expression<E>

  /**
   * Evaluates one or more expressions and returns `true` if any of the
   * expressions are `true`. Otherwise, returns `false`.
   */
  $or?: Expression<E>[]

  /**
   * Raises a number to the specified exponent and returns the result.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/pow
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $pow?: [Expression<E>, Expression<E>]

  /**
   * Returns an array whose elements are a generated sequence of numbers.
   *
   * Generates the sequence from the specified starting number by successively
   * incrementing the starting number by the specified step value up to but not
   * including the end point.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers. If defined, the third expression must resolve to a non-zero
   * number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/range
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $range?:
    | [Expression<E>, Expression<E>, Expression<E>]
    | [Expression<E>, Expression<E>]

  /**
   * Applies an expression to each element in an array and combines them into a
   * single value.
   *
   * The `input` field can be any valid [expression][1] as long as it resolves
   * to an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/reduce
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $reduce?: {
    initialValue: Expression<E>
    input: Expression<E>
    in: Expression<E>
  }

  /**
   * Returns an array with the elements in reverse order.
   *
   * Can be any valid [expression][1] as long as it resolves to an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/reverseArray
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $reverseArray?: Expression<E>

  /**
   * Rounds a number to a whole integer or to a specified decimal place.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers. The second item, if defined, should resolve to a number between
   * `-20` and `100`.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/round
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $round?: [Expression<E>, Expression<E>] | [Expression<E>]

  /**
   * Takes two sets and returns an array containing the elements that only exist
   * in the first set.
   *
   * Each item can be any valid [expression][1] as long as they each resolve to
   * an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/setDifference
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $setDifference?: [Expression<E>, Expression<E>]

  /**
   * Compares two or more arrays and returns `true` if they have the same
   * distinct elements and `false` otherwise.
   *
   * Each item can be any valid [expression][1] as long as they each resolve to
   * an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/setEquals
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $setEquals?: Expression<E>[]

  /**
   * Takes two or more arrays and returns an array that contains the elements
   * that appear in every input array.
   *
   * Each item can be any valid [expression][1] as long as they each resolve to
   * an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/setIntersection
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $setIntersection?: Expression<E>[]

  /**
   * Takes two arrays and returns `true` when the first array is a subset of the
   * second, including when the first array equals the second array, and `false`
   * otherwise.
   *
   * Each item can be any valid [expression][1] as long as they each resolve to
   * an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/setIsSubset
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $setIsSubset?: [Expression<E>, Expression<E>]

  /**
   * Takes two or more arrays and returns an array containing the elements that
   * appear in any input array.
   *
   * Each item can be any valid [expression][1] as long as they each resolve to
   * an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/setUnion
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $setUnion?: Expression<E>[]

  /**
   * Counts and returns the total number of items in an array.
   *
   * Can be any valid [expression][1] as long as it resolves to an array.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/size
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $size?: Expression<E>

  /**
   * Returns a subset of an array.
   *
   * Each item can be any valid [expression][1] as long as the first item
   * resolves to an array, and the second and (optional) third item resolve to
   * numbers.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/slice
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $slice?:
    | [Expression<E>, Expression<E>, Expression<E>]
    | [Expression<E>, Expression<E>]

  /**
   * Divides a string into an array of substrings based on a delimiter.
   *
   * Each item can be any valid [expression][1] as long as they each resolve to
   * strings.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/split
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $split?: [Expression<E>, Expression<E>]

  /**
   * Calculates the square root of a positive number and returns the result as a
   * double.
   *
   * Can be any valid [expression][1] as long as it resolves to a non-negative
   * number.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/sqrt
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $sqrt?: Expression<E>

  /**
   * Returns the number of UTF-8 [code points][1] in the specified string.
   *
   * Can be any valid [expression][2] as long as it resolves to a string.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/strLenCP
   *
   * [1]: http://www.unicode.org/glossary/#code_point
   * [2]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $strLenCP?: Expression<E>

  /**
   * Performs case-insensitive comparison of two strings. Returns:
   *
   * - `1`: first string is "greater than" the second string
   * - `0`: the two strings are equal
   * - `-1`: first string is "less than" the second string
   *
   * Each item can be any valid [expression][1] as long as they each resolve to
   * strings.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/strcasecmp
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $strcasecmp?: [Expression<E>, Expression<E>]

  /**
   * Subtracts two numbers to return the difference, or two dates to return the
   * difference in milliseconds, or a date and a number in milliseconds to
   * return the resulting date.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers and/or dates.
   *
   * To subtract a number from a date, the date must be the first argument.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/subtract
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $subtract?: [Expression<E>, Expression<E>]

  /**
   * Evaluates a series of case expressions. When an expression that evaluates
   * to `true` is found, `$switch` executes a specified expression and breaks
   * out of the control flow.
   *
   * The `case` field of each branch in the `branches` can be any valid
   * [expression][1] that resolves to a boolean value.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/switch
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $switch?: {
    branches: { case: Expression<E>; then: Expression<E> }[]
    default: Expression<E>
  }

  /**
   * Converts a string to lowercase, returning the result.
   *
   * Can be any valid [expression][1] as long as it resolves to a string.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/toLower
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $toLower?: Expression<E>

  /**
   * Converts a string to uppercase, returning the result.
   *
   * Can be any valid [expression][1] as long as it resolves to a string.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/toUpper
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $toUpper?: Expression<E>

  /**
   * Removes whitespace characters, including `null`, or the specified
   * characters (`chars`) from the beginning and end of a string.
   *
   * Both the `chars` and `input` fields can be any valid [expression][1] as
   * long as they each resolve to a string.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/trim
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $trim?: { chars?: Expression<E>; input: Expression<E> }

  /**
   * Truncates a number to a whole integer or to a specified decimal place.
   *
   * Each item can be any valid [expression][1] as long as they resolve to
   * numbers. The second item, if defined, should resolve to a number between
   * `-20` and `100`.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/trunc
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $trunc?: [Expression<E>, Expression<E>] | [Expression<E>]

  /**
   * Transposes an array of input arrays so that the first element of the output
   * array would be an array containing, the first element of the first input
   * array, the first element of the second input array, etc.
   *
   * For example, `$zip` would transform `[ [ 1, 2, 3 ], [ 'a', 'b', 'c' ] ]`
   * into `[ [ 1, 'a' ], [ 2, 'b' ], [ 3, 'c' ] ]`.
   *
   * The `defaults` field can be any valid [expression][1] that resolves to an
   * array. The `inputs` field can be any valid [expression][1] that resolves to
   * an array of arrays.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/zip
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
   */
  $zip?: {
    defaults?: Expression<E>
    inputs: Expression<E>[]
    useLongestLength?: boolean
  }
}
