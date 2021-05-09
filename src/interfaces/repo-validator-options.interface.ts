import type { TransformValidationOptions } from 'class-transformer-validator'

/**
 * @file Interface - RepoValidatorOptions
 * @module interfaces/RepoValidatorOptions
 */

/**
 * Repository Validation API options accepted by the `Repository` class.
 */
export interface RepoValidatorOptions {
  /**
   * Disable or enabled validation before write (`create`, `patch`) operations.
   *
   * @default true
   */
  enabled?: boolean

  /**
   * Options to be passed during transformation.
   *
   * @default {}
   */
  transformer?: TransformValidationOptions['transformer']

  /**
   * Options passed to entity model validator during validation.
   *
   * @default {}
   */
  validator?: TransformValidationOptions['validator']
}
