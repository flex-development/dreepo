import type { NullishString } from '@/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import { REPO_PATH_CARS } from '@tests/fixtures/cars.fixture'
import CLIENT_EMAIL from '@tests/fixtures/client-email.fixture'
import DATABASE_URL from '@tests/fixtures/database-url.fixture'
import PRIVATE_KEY from '@tests/fixtures/private-key.fixture'
import pick from 'lodash.pick'
import { isType } from 'type-plus'
import TestSubject from '../db-connection.provider'

/**
 * @file Unit Tests - DBConnection
 * @module providers/tests/DBConnection
 */

describe('unit:providers/DBConnection', () => {
  const mockHttp = jest.fn().mockReturnValue(Promise.resolve({ data: [] }))

  const mockConstructorParams: ConstructorParameters<typeof TestSubject> = [
    DATABASE_URL,
    CLIENT_EMAIL,
    PRIVATE_KEY,
    mockHttp
  ]

  const Subject = new TestSubject(...mockConstructorParams)

  describe('constructor', () => {
    it('should initialize instance properties', () => {
      const ThisSubject = new TestSubject(...mockConstructorParams)

      expect(typeof ThisSubject.client_email === 'string').toBeTruthy()
      expect(ThisSubject.http).toBe(mockHttp)
      expect(ThisSubject.jwt).toBeDefined()
      expect(typeof ThisSubject.private_key === 'string').toBeTruthy()
      expect(typeof ThisSubject.url === 'string').toBeTruthy()
    })

    describe('should throw', () => {
      it('should throw if url is invalid', () => {
        let exception = {} as Exception

        const url = 'https://foo.badfirebaseio.com'

        try {
          new TestSubject(url, CLIENT_EMAIL, PRIVATE_KEY)
        } catch (error) {
          exception = error
        }

        expect(exception.code).toBe(ExceptionStatusCode.BAD_REQUEST)
        expect(exception.data.url_options).toBePlainObject()
        expect(exception.errors).toMatchObject({ url })
        expect(exception.message).toBe('Invalid database URL')
      })

      it('should throw if client_email is not an email address', () => {
        let exception = {} as Exception

        const client_email = ''

        try {
          new TestSubject(DATABASE_URL, client_email, PRIVATE_KEY)
        } catch (error) {
          exception = error
        }

        expect(exception.code).toBe(ExceptionStatusCode.UNAUTHORIZED)
        expect(exception.errors).toMatchObject({ client_email })
        expect(exception.message).toBe('Invalid service account client_email')
      })

      it('should throw if private_key is not non-empty string', () => {
        let exception = {} as Exception

        const private_key = ''

        try {
          new TestSubject(DATABASE_URL, CLIENT_EMAIL, private_key)
        } catch (error) {
          exception = error
        }

        expect(exception.code).toBe(ExceptionStatusCode.UNAUTHORIZED)
        expect(exception.errors).toMatchObject({ private_key })
        expect(exception.message).toBe(
          'Service account private_key must be a non-empty string'
        )
      })
    })
  })

  describe('#request', () => {
    const spy_token = jest.spyOn(Subject, 'token')

    beforeEach(async () => {
      await Subject.request(REPO_PATH_CARS, {})
    })

    it('should call #http', () => {
      expect(mockHttp).toBeCalledTimes(1)
    })

    it('should set config.url to #url/path', () => {
      const expected = `${Subject.url}/${REPO_PATH_CARS}`

      expect(mockHttp.mock.calls[0][0].baseURL).toBe(expected)
    })

    it('should make authenticated request', () => {
      expect(spy_token).toBeCalledTimes(1)
    })

    it('should append `.json` to the end of config.url', () => {
      expect(mockHttp).toBeCalledTimes(1)
      expect(mockHttp.mock.calls[0][0].url).toBe(`/.json`)
    })
  })

  describe('#token', () => {
    // @ts-expect-error testing invocation
    const spy_jwt_authorizeAsync = jest.spyOn(Subject.jwt, 'authorizeAsync')

    it('should generate google oauth2 token', async () => {
      spy_jwt_authorizeAsync.mockReturnValueOnce(Promise.resolve('TOKEN'))

      const access_token: any = await Subject.token()

      expect(isType<NullishString>(access_token)).toBeTruthy()
    })

    it('should throw Exception if #jwt.authorize throws', async () => {
      const error = new Error('Test error message')
      const jwtd = pick(Subject.jwt, ['email', 'key', 'scopes'])

      spy_jwt_authorizeAsync.mockReturnValueOnce(Promise.reject(error))

      let exception = {} as Exception

      try {
        await Subject.token()
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
})
