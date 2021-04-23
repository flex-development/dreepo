import {
  ExceptionClassName as ClassName,
  ExceptionClassName,
  ExceptionStatus as Status
} from '@rtd-repos/lib/enums'
import type { ExceptionJSON } from '@rtd-repos/lib/interfaces'
import type {
  ANY,
  EmptyString,
  ExceptionErrors as Errors,
  ExceptionName as Name
} from '@rtd-repos/lib/types'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import omit from 'lodash/omit'
import type { PlainObject } from 'simplytyped'
import { DEM } from './constants.exceptions'

/**
 * @file Global Exceptions - Exception Base Class
 * @module lib/exceptions/Exception
 */

export default class Exception extends Error {
  /**
   * @property {ClassName} errors - Exception CSS class name
   */
  className: ClassName

  /**
   * @property {Errors} errors - Exception errors
   */
  errors: Errors

  /**
   * @property {Name} errors - Exception name
   */
  name: Name

  /**
   * Instantiate a new Exception.
   *
   * @param {Status} [code] - HTTP error status code
   * @param {string} [message] - Error message
   * @param {PlainObject} [data] - Additional error data
   * @param {Errors} [data.errors] - Exception errors
   * @param {string} [data.message] - Overrides {@param message}
   */
  constructor(
    public code: Status = Status.INTERNAL_SERVER_ERROR,
    public message: string = DEM,
    public data: PlainObject = {}
  ) {
    super()

    const $data = isPlainObject(data)
    const $errors = isArray(data.errors) || isPlainObject(data.errors)

    this.code = Exception.formatCode(code)
    this.name = Exception.findNameByCode(this.code) as Name
    this.className = ExceptionClassName[this.name]
    this.data = $data ? omit(data, ['errors', 'message']) : {}
    this.errors = $errors ? data.errors : null
    this.message = data.message?.length ? data.message : message
  }

  /**
   * Finds the name of an exception by status code.
   *
   * @param {Status} code - Status code associated with exception name
   * @return {Name | EmptyString} - Name of exception or empty string
   */
  static findNameByCode(code: Status): Name | EmptyString {
    const name = Object.keys(Status).find(key => Status[key] === code)
    return (name as Name) || ''
  }

  /**
   * Returns `500` if {@param code} is not a valid exception status code.
   *
   * @param {ANY} [code] - Value to validate
   * @return {Status} Exception status code
   */
  static formatCode(code?: ANY): Status {
    return Object.values(Status).includes(code) ? code : 500
  }

  /**
   * Returns a JSON object representing the current Exception.
   *
   * @return {ExceptionJSON} JSON object representing Exception
   */
  toJSON(): ExceptionJSON {
    /* eslint-disable sort-keys */

    return {
      name: this.name,
      message: this.message,
      code: this.code,
      className: this.className,
      data: this.data,
      errors: this.errors
    }

    /* eslint-enable sort-keys */
  }
}
