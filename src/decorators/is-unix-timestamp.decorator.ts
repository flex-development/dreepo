import validator from '@/constraints/is-unix-timestamp.constraint'
import type { ValidationOptions } from 'class-validator'
import { ValidateBy } from 'class-validator'

/**
 * @file Decorator - IsUnixTimestamp
 * @module decorators/IsUnixTimestamp
 */

/**
 * Custom decorator that ensures a value is a [Unix timestamp][1].
 *
 * [1]: https://en.wikipedia.org/wiki/Unix_time
 *
 * @param {ValidationOptions} [voptions] - Validation options
 * @return {PropertyDecorator} Property decorator
 */
const IsUnixTimestamp = (voptions?: ValidationOptions): PropertyDecorator => {
  return ValidateBy({ name: validator.name, validator }, voptions)
}

export default IsUnixTimestamp
