import type { ValidatorConstraintOptions } from '@/types'
import type {
  ValidationArguments,
  ValidatorConstraintInterface as IConstraint
} from 'class-validator'
import { isNumber, ValidatorConstraint as Constraint } from 'class-validator'

/**
 * @file Constraint - IsUnixTimestampConstraint
 * @module constraints/IsUnixTimestampConstraint
 * @see https://github.com/typestack/class-validator#custom-validation-classes
 */

@Constraint(IsUnixTimestampConstraint.options)
export default class IsUnixTimestampConstraint implements IConstraint {
  /**
   * @static
   * @readonly
   * @property {ValidatorConstraintOptions} options - Custom constraint options
   */
  static readonly options: ValidatorConstraintOptions = {
    async: false,
    name: 'isUnixTimestamp'
  }

  /**
   * Returns the default error message if constraint validation fails.
   *
   * @param {ValidationArguments} args - Arguments sent to message builders
   * @return {string} Default error message
   */
  defaultMessage(args: ValidationArguments): string {
    return `$property must be unix timestamp; received ${args.value}`
  }

  /**
   * Returns `true` if {@param value} is a [Unix timestamp][1].
   *
   * [1]: https://en.wikipedia.org/wiki/Unix_time
   *
   * @param {any} value - Value to test against constraint
   * @param {ValidationArguments} args - Arguments sent to message builders
   * @return {boolean} Boolean indicating is value is Unix timestamp
   */
  validate(value: any, args: ValidationArguments): boolean {
    if (!isNumber(value)) return false
    return isNumber(new Date(value).getTime())
  }
}
