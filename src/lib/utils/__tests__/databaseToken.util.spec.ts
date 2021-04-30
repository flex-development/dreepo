import jwt from '@/config/jwt'
import type { NullishString } from '@/lib/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import pick from 'lodash.pick'
import { isType } from 'type-plus'
import testSubject from '../databaseToken.util'

/**
 * @file Unit Tests - databaseToken
 * @module lib/utils/tests/databaseToken
 */

describe('unit:lib/utils/databaseToken', () => {
  // @ts-expect-error testing invocation
  const spy_jwt_authorizeAsync = jest.spyOn(jwt, 'authorizeAsync')

  it('should generate google oauth2 token', async () => {
    spy_jwt_authorizeAsync.mockReturnValueOnce(Promise.resolve('TOKEN'))

    const access_token: any = await testSubject()

    expect(isType<NullishString>(access_token)).toBeTruthy()
  })

  it('should throw Exception if jwt.authorize throws', async () => {
    const error = new Error('Test error message')
    const jwtd = pick(jwt, ['email', 'key', 'scopes'])

    spy_jwt_authorizeAsync.mockReturnValueOnce(Promise.reject(error))

    let exception = {} as Exception

    try {
      await testSubject()
    } catch (error) {
      exception = error
    }

    const ejson = exception.toJSON()

    expect(exception.stack).toBe(error.stack)

    expect(ejson.code).toBe(ExceptionStatusCode.UNAUTHORIZED)
    expect(ejson.data).toMatchObject(jwtd)
    expect(ejson.message).toBe(error.message)
  })
})
