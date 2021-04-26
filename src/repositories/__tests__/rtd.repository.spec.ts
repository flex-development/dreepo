import configuration from '@/config/configuration'
import type { NullishString } from '@/lib/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { JWT } from 'google-auth-library'
import pick from 'lodash.pick'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import { isType } from 'type-plus'
import TestSubject from '../rtd.repository'
import type { CarEntity } from './__fixtures__/cars.fixture'
import {
  Car,
  CARS,
  CARS_ROOT,
  REPO_PATH_CARS
} from './__fixtures__/cars.fixture'

/**
 * @file Unit Tests - RTDRepository
 * @module repositories/tests/RTDRepository
 */

describe('unit:repositories/RTDRepository', () => {
  const { FIREBASE_DATABASE_URL, FIREBASE_RTD_REPOS_VALIDATE } = configuration()

  const getSubject = () => new TestSubject<CarEntity>(REPO_PATH_CARS, Car)

  describe('exports', () => {
    it('should export class by default', () => {
      expect(TestSubject).toBeDefined()
      expect(TestSubject.constructor.name).toBe('Function')
    })
  })

  describe('constructor', () => {
    it('should initialize instance properties', () => {
      const Subject = getSubject()

      expect(Subject.DATABASE_URL).toBe(FIREBASE_DATABASE_URL)
      expect(Subject.cache).toMatchObject({ collection: [], root: {} })
      expect(Subject.http).toBeDefined()
      expect(isType<JWT>(Subject.jwt as any)).toBeTruthy()
      expect(isType<RuntypeBase<CarEntity>>(Subject.model as any)).toBeTruthy()
      expect(Subject.path).toBe(REPO_PATH_CARS)
      expect(Subject.validate).toBe(FIREBASE_RTD_REPOS_VALIDATE)
    })
  })

  describe('#accessToken', () => {
    const Subject = getSubject()

    it('should generate google oauth2 token', async () => {
      const access_token: any = await Subject.accessToken()

      expect(isType<NullishString>(access_token)).toBeTruthy()
    })

    it('should throw Exception if #jwt.authorize throws', async () => {
      // @ts-expect-error testing invocation
      const spy = jest.spyOn(Subject.jwt, 'authorizeAsync')

      const error = new Error('Test error message')
      const jwtd = pick(Subject.jwt, ['email', 'key', 'scopes'])

      spy.mockReturnValueOnce(Promise.reject(error))

      let exception = {} as Exception

      try {
        await Subject.accessToken()
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

  describe('#refreshCache', () => {
    const Subject = getSubject()

    const spy = jest.spyOn(Subject, 'request')

    beforeEach(() => {
      spy.mockReturnValue(Promise.resolve(CARS_ROOT))
    })

    it('should request repository root data', async () => {
      await Subject.refreshCache()

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith()
    })

    it('should update data cache', async () => {
      const result = await Subject.refreshCache()

      expect(result).toMatchObject({ collection: CARS, root: CARS_ROOT })
    })
  })

  describe('#request', () => {
    const Subject = getSubject()

    const spy_accessToken = jest.spyOn(Subject, 'accessToken')
    const spy_http = jest.spyOn(Subject, 'http')

    beforeEach(async () => {
      spy_http.mockReturnValue(Promise.resolve({ data: [] }))
      await Subject.request()
    })

    it('should set config.url to #DATABASE_URL/#path', () => {
      expect(spy_http).toBeCalledTimes(1)

      const expected = `${Subject.DATABASE_URL}/${Subject.path}`

      expect(spy_http.mock.calls[0][0].baseURL).toBe(expected)
    })

    it('should make authenticated request', () => {
      expect(spy_accessToken).toBeCalledTimes(1)
    })

    it('should append `.json` to the end of config.url', () => {
      expect(spy_http).toBeCalledTimes(1)
      expect(spy_http.mock.calls[0][0].url).toBe(`/.json`)
    })
  })
})
