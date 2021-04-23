import { ExceptionClassName, ExceptionStatus } from '@rtd-repos/lib/enums'
import type { ExceptionErrors, ExceptionName } from '@rtd-repos/lib/types'
import type { PlainObject } from 'simplytyped'

/**
 * @file Global Interface - ExceptionJSON
 * @module lib/interfaces/ExceptionJSON
 */

export interface ExceptionJSON {
  readonly className: ExceptionClassName
  readonly code: ExceptionStatus
  readonly data: PlainObject
  readonly errors?: ExceptionErrors
  readonly message: string
  readonly name: ExceptionName
}
