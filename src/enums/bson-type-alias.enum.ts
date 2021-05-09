/**
 * @file Enums - BSONTypeAlias
 * @module enums/BSONTypeAlias
 */

/**
 * String aliases corresponding to [BSON types][1].
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/query/type/#available-types
 */
export enum BSONTypeAlias {
  BOOL = 'bool',
  DECIMAL = 'decimal',
  DOUBLE = 'double',
  INT = 'int',
  LONG = 'long',
  REGEX = 'regex'
}
