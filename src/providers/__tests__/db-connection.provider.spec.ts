import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import { REPO_PATH_CARS } from '@tests/fixtures/cars.fixture'
import CLIENT_EMAIL from '@tests/fixtures/client-email.fixture'
import DATABASE_URL from '@tests/fixtures/database-url.fixture'
import PRIVATE_KEY from '@tests/fixtures/private-key.fixture'
import pick from 'lodash.pick'
import TestSubject from '../db-connection.provider'

/**
 * @file Unit Tests - DBConnection
 * @module providers/tests/DBConnection
 */

describe('unit:providers/DBConnection', () => {
  const mockAccessToken = Promise.resolve({ access_token: 'ACCESS_TOKEN' })
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
      // Act
      const ThisSubject = new TestSubject(...mockConstructorParams)

      // Expect
      expect(typeof ThisSubject.client_email === 'string').toBeTruthy()
      expect(ThisSubject.http).toBe(mockHttp)
      expect(ThisSubject.jwt).toBeDefined()
      expect(typeof ThisSubject.private_key === 'string').toBeTruthy()
      expect(typeof ThisSubject.url === 'string').toBeTruthy()
    })

    describe('should throw', () => {
      it('should throw if url is invalid', () => {
        // Arrange
        const url = 'https://foo.badfirebaseio.com'
        let exception = {} as Exception

        // Act
        try {
          new TestSubject(url, CLIENT_EMAIL, PRIVATE_KEY)
        } catch (error) {
          exception = error
        }

        // Expect
        expect(exception.code).toBe(ExceptionStatusCode.BAD_REQUEST)
        expect(exception.data.url_options).toBeObject()
        expect(exception.errors).toMatchObject({ url })
        expect(exception.message).toBe('Invalid database URL')
      })

      it('should throw if client_email is not an email address', () => {
        // Arrange
        let exception = {} as Exception
        const client_email = ''

        // Act
        try {
          new TestSubject(DATABASE_URL, client_email, PRIVATE_KEY)
        } catch (error) {
          exception = error
        }

        // Expect
        expect(exception.code).toBe(ExceptionStatusCode.UNAUTHORIZED)
        expect(exception.errors).toMatchObject({ client_email })
        expect(exception.message).toBe('Invalid service account client_email')
      })

      it('should throw if private_key is not non-empty string', () => {
        // Arrange
        const private_key = ''
        let exception = {} as Exception

        // Act
        try {
          new TestSubject(DATABASE_URL, CLIENT_EMAIL, private_key)
        } catch (error) {
          exception = error
        }

        // Expect
        expect(exception.code).toBe(ExceptionStatusCode.UNAUTHORIZED)
        expect(exception.errors).toMatchObject({ private_key })
        expect(exception.message).toBe(
          'Service account private_key must be a non-empty string'
        )
      })
    })
  })

  describe('#request', () => {
    // @ts-expect-error testing
    const spy_authorizeAsync = jest.spyOn(Subject.jwt, 'authorizeAsync')
    const spy_token = jest.spyOn(Subject, 'token')

    beforeEach(async () => {
      spy_authorizeAsync.mockReturnValueOnce(mockAccessToken)
      await Subject.request(REPO_PATH_CARS, {})
    })

    it('should call #http', () => {
      expect(mockHttp).toBeCalledTimes(1)
    })

    it('should set config.url to #url/path', () => {
      // Arrange
      const expected = `${Subject.url}/${REPO_PATH_CARS}`

      // Expect
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
      // Act
      spy_jwt_authorizeAsync.mockReturnValueOnce(mockAccessToken)

      const access_token = await Subject.token()

      // Expect
      expect(typeof access_token === 'string').toBeTruthy()
    })

    it('should throw Exception if #jwt.authorize throws', async () => {
      // Arrange
      const error = new Error('Test error message')
      let exception = {} as Exception

      // Act
      spy_jwt_authorizeAsync.mockReturnValueOnce(Promise.reject(error))

      try {
        await Subject.token()
      } catch (error) {
        exception = error
      }

      // Expect
      expect(exception).toMatchObject({
        code: ExceptionStatusCode.UNAUTHORIZED,
        data: pick(Subject.jwt, ['email', 'key', 'scopes']),
        message: error.message,
        stack: error.stack
      })
    })
  })
})
