import type { TransformValidationOptions } from 'class-transformer-validator'
import { ValidatorConstraint } from 'class-validator'

/**
 * @file Type Definitions - Validation
 * @module types.validation
 */

/**
 * Default options object for [`class-transformer-validator`][1].
 *
 * [1]: https://github.com/MichalLytek/class-transformer-validator
 */
export type TVODefaults = Readonly<TransformValidationOptions>

/**
 * Custom validation class options.
 *
 * - https://github.com/typestack/class-validator#custom-validation-classes
 */
export type ValidatorConstraintOptions = Parameters<
  typeof ValidatorConstraint
>[0]
