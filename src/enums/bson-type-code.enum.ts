/**
 * @file Enums - BSONTypeCode
 * @module enums/BSONTypeCode
 */

/**
 * Numbers corresponding to [BSON types][1].
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/query/type/#available-types
 */
export enum BSONTypeCode {
  BOOL = 8,
  DECIMAL = 19,
  DOUBLE = 1,
  INT = 16,
  LONG = 18,
  REGEX = 11
}
