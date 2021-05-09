import Exception from '@flex-development/exceptions/exceptions/base.exception'
import { ExceptionJSON } from '@flex-development/exceptions/interfaces'
import { isType } from 'type-plus'
import testSubject from '../onRejected.util'
import AXIOS_ERROR from './__fixtures__/axios-error.fixture'

/**
 * @file Unit Tests - onRejected
 * @module utils/tests/onRejected
 */

describe('unit:utils/onRejected', () => {
  it('should throw ExceptionJSON object', () => {
    const spy_fromAxiosError = jest.spyOn(Exception, 'fromAxiosError')

    let ejson: any = {}

    try {
      testSubject(AXIOS_ERROR)
    } catch (error) {
      ejson = error
    }

    expect(spy_fromAxiosError).toBeCalledTimes(1)
    expect(spy_fromAxiosError).toBeCalledWith(AXIOS_ERROR)

    expect(isType<ExceptionJSON>(ejson)).toBeTruthy()
  })
})
