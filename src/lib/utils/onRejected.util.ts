import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { AxiosError } from '@flex-development/exceptions/interfaces'

/**
 * @file Implementation - onRejected
 * @module lib/utils/onRejected
 */

/**
 * Transforms an `AxiosError` into an `ExceptionJSON` object.
 *
 * @param {AxiosError} error - HTTP error to transform
 * @throws {ExceptionJSON}
 */
const onRejected = (error: AxiosError): void => {
  const exception = Exception.fromAxiosError(error)
  throw exception.toJSON()
}

export default onRejected
