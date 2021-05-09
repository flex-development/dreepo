import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { PlainObject } from '@flex-development/exceptions/types'
import type { ClassTransformOptions as TransformOpts } from 'class-transformer'
import { plainToClass } from 'class-transformer'
import { transformAndValidate } from 'class-transformer-validator'
import type { ValidationError, ValidatorOptions } from 'class-validator'
import merge from 'lodash.merge'
import { TVO_DEFAULTS } from '../constants'
import type {
  IEntity,
  IRepoValidator,
  RepoValidatorOptions
} from '../interfaces'
import { EntityClass } from '../types'

/**
 * @file Mixin - RepoValidator
 * @module mixins/RepoValidator
 */

/**
 * Handles validating repository entities.
 *
 * @template E - Entity
 *
 * @class
 * @implements {IRepoValidator}
 */
export default class RepoValidator<E extends IEntity>
  implements IRepoValidator<E> {
  /**
   * @readonly
   * @instance
   * @property {boolean} enabled - Toggle validation
   */
  readonly enabled: boolean

  /**
   * @readonly
   * @instance
   * @property {EntityClass<E>} model - Entity model
   */
  readonly model: EntityClass<E>

  /**
   * @readonly
   * @instance
   * @property {Omit<RepoValidatorOptions, 'enabled'>} tvo - Validation options
   */
  readonly tvo: Omit<RepoValidatorOptions, 'enabled'>

  /**
   * @readonly
   * @instance
   * @property {typeof transformAndValidate} tvo - Validation function
   */
  readonly validator: typeof transformAndValidate = transformAndValidate

  /**
   * Instantiates a new repository validator.
   *
   * See:
   *
   * - https://github.com/pleerock/class-validator
   * - https://github.com/typestack/class-transformer
   * - https://github.com/MichalLytek/class-transformer-validator
   *
   * @param {EntityClass<E>} model - Entity model
   * @param {RepoValidatorOptions} [options] - Repo Validation API options
   * @param {boolean} [options.enabled] - Toggle schema validation
   * @param {TransformOpts} [options.transformer] - `class-transformer` options
   * @param {ValidatorOptions} [options.validator] - `class-validator` options
   */
  constructor(model: EntityClass<E>, options: RepoValidatorOptions = {}) {
    const { enabled = true, transformer = {}, validator = {} } = options

    this.enabled = enabled
    this.model = model
    this.tvo = merge(TVO_DEFAULTS, { transformer, validator })
  }

  /**
   * Validates {@param value} against {@see RepoValidator#model} if the Repo
   * Validation API is enabled. Otherwise, the original value will be returned.
   *
   * References:
   *
   * - https://github.com/MichalLytek/class-transformer-validator
   *
   * @template Value - Type of value being validated
   *
   * @param {Value} value - Data to validate
   * @return {Promise<E | Value>} - Promise containing value
   * @throws {Exception}
   */
  async check<Value extends unknown = PlainObject>(
    value: Value = {} as Value
  ): Promise<E | Value> {
    if (!this.enabled) return value

    try {
      return (await this.validator<E>(this.model, value as any, this.tvo)) as E
    } catch (error) {
      let code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      let data = {}
      let message = error.message

      if (Array.isArray(error)) {
        const errors = error as ValidationError[]
        const properties = errors.map(e => e.property)
        const target = plainToClass(this.model, value, this.tvo.transformer)
        const target_name = target.constructor.name

        code = ExceptionStatusCode.BAD_REQUEST
        data = { errors, target }
        message = `${target_name} entity validation failure: [${properties}]`
      }

      throw new Exception(
        code,
        message,
        merge(data, { options: this.tvo }),
        error.stack
      )
    }
  }
}
