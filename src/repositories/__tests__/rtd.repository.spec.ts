import configuration from '@/config/configuration'
import { SortOrder } from '@/lib/enums'
import type { AggregationStages } from '@/lib/interfaces'
import type { NullishString } from '@/lib/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { JWT } from 'google-auth-library'
import pick from 'lodash.pick'
import type { RawObject } from 'mingo/util'
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

  const mockCache = { collection: CARS, root: CARS_ROOT }

  const ENTITY = mockCache.collection[0]

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

  describe('#aggregate', () => {
    const Subject = getSubject()

    const stage: AggregationStages<CarEntity> = { $count: 'count' }

    const spy_aggregate = jest.spyOn(Subject.mingo, 'aggregate')

    it('should not call #mingo.aggregate if cache is empty', () => {
      // @ts-expect-error mocking
      Subject.cache = { collection: [], root: {} }

      Subject.aggregate()

      expect(spy_aggregate).toBeCalledTimes(0)
    })

    it('should throw Exception if error occurs', () => {
      // @ts-expect-error mocking
      Subject.cache = mockCache

      const pipeline = [stage]
      const error_message = 'Test aggregate error'

      let exception = {} as Exception

      try {
        jest.spyOn(Subject.mingo, 'aggregate').mockImplementationOnce(() => {
          throw new Error(error_message)
        })

        Subject.aggregate(pipeline)
      } catch (error) {
        exception = error
      }

      expect(exception.code).toBe(ExceptionStatusCode.BAD_REQUEST)
      expect(exception.data).toMatchObject({ pipeline })
      expect(exception.message).toBe(error_message)
    })

    describe('runs pipeline', () => {
      it('should run pipeline after converting stage into stages array', () => {
        // @ts-expect-error mocking
        Subject.cache = mockCache

        Subject.aggregate(stage)

        expect(spy_aggregate).toBeCalledTimes(1)
        expect(spy_aggregate).toBeCalledWith(
          Subject.cache.collection,
          [stage],
          Subject.mopts
        )
      })

      it('should run pipeline with stages array', () => {
        // @ts-expect-error mocking
        Subject.cache = mockCache

        const pipeline = [stage]

        Subject.aggregate(pipeline)

        expect(spy_aggregate).toBeCalledTimes(1)
        expect(spy_aggregate).toBeCalledWith(
          Subject.cache.collection,
          pipeline,
          Subject.mopts
        )
      })
    })
  })

  describe('#find', () => {
    const Subject = getSubject()

    const mockCursor = {
      all: jest.fn().mockReturnValue(mockCache.collection),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis()
    }

    const mockFind = jest.fn().mockReturnValue(mockCursor)

    beforeAll(() => {
      Subject.mingo.find = mockFind
    })

    it('should not call #mingo.find if cache is empty', () => {
      // @ts-expect-error mocking
      Subject.cache = { collection: [], root: {} }

      Subject.find()

      expect(Subject.mingo.find).toBeCalledTimes(0)
    })

    it('should handle query criteria', () => {
      // @ts-expect-error mocking
      Subject.cache = mockCache

      const params = { id: Subject.cache.collection[0].id }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(Subject.mingo.find).toBeCalledWith(
        Subject.cache.collection,
        { id: params.id },
        {},
        Subject.mopts
      )
    })

    it('should sort results', () => {
      // @ts-expect-error mocking
      Subject.cache = mockCache

      const params = { $sort: { id: SortOrder.ASCENDING } }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(mockCursor.sort).toBeCalledWith(params.$sort)
    })

    it('should offset results', () => {
      // @ts-expect-error mocking
      Subject.cache = mockCache

      const params = { $skip: 2 }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(mockCursor.skip).toBeCalledWith(params.$skip)
    })

    it('should limit results', () => {
      // @ts-expect-error mocking
      Subject.cache = mockCache

      const params = { $limit: 1 }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(mockCursor.limit).toBeCalledWith(params.$limit)
    })

    it('should run aggregation pipeline with $project stage', () => {
      // @ts-expect-error mocking
      Subject.cache = mockCache

      const spy_aggregate = jest.spyOn(Subject, 'aggregate')

      const params = { $project: { model: true } }

      Subject.find(params)

      expect(spy_aggregate).toBeCalledTimes(1)
      expect(spy_aggregate).toBeCalledWith({ $project: params.$project })
    })

    it('should throw Exception if error occurs', () => {
      // @ts-expect-error mocking
      Subject.cache = mockCache

      const error_message = 'Test find error'
      let exception = {} as Exception

      try {
        jest.spyOn(Subject.mingo, 'find').mockImplementationOnce(() => {
          throw new Error(error_message)
        })

        Subject.find()
      } catch (error) {
        exception = error
      }

      expect(exception.code).toBe(ExceptionStatusCode.BAD_REQUEST)
      expect(exception.data).toMatchObject({ params: {}, projection: {} })
      expect(exception.message).toBe(error_message)
    })
  })

  describe('#findByIds', () => {
    const Subject = getSubject()

    const spy_find = jest.spyOn(Subject, 'find')

    beforeAll(() => {
      // @ts-expect-error mocking
      Subject.cache = mockCache
    })

    it('return specified entities', () => {
      const ids = [ENTITY.id]

      const entities = Subject.findByIds(ids)

      expect(spy_find).toBeCalledTimes(1)
      expect(spy_find).toBeCalledWith({})

      expect(entities.length).toBe(ids.length)
    })

    describe('throws Exception', () => {
      it('should throw Exception if error is Error class type', () => {
        let exception = {} as Exception

        try {
          // @ts-expect-error mocking
          jest.spyOn(Array.prototype, 'includes').mockImplementationOnce(() => {
            throw new Error()
          })

          Subject.findByIds()
        } catch (error) {
          exception = error
        }

        expect(exception.constructor.name).toBe('Exception')
      })

      it('should throw Exception if error is Exception class type', () => {
        let exception = {} as Exception

        try {
          spy_find.mockImplementationOnce(() => {
            throw new Exception()
          })

          Subject.findByIds()
        } catch (error) {
          exception = error
        }

        expect(exception.constructor.name).toBe('Exception')
      })
    })
  })

  describe('#findOne', () => {
    const Subject = getSubject()

    const spy_find = jest.spyOn(Subject, 'find')

    beforeAll(() => {
      // @ts-expect-error mocking
      Subject.cache = mockCache
    })

    it('should return entity', () => {
      spy_find.mockReturnValue([ENTITY])

      const result = Subject.findOne(ENTITY.id)

      expect(spy_find).toBeCalledTimes(1)
      expect(spy_find).toBeCalledWith({ id: ENTITY.id })

      expect(result).toMatchObject(ENTITY)
    })

    it('should return null if entity is not found', () => {
      const id = 'NON_EXISTENT_ENTITY_ID'

      spy_find.mockReturnValue([])

      const result = Subject.findOne(id)

      expect(spy_find).toBeCalledTimes(1)
      expect(spy_find).toBeCalledWith({ id })

      expect(result).toBe(null)
    })
  })

  describe('#findOneOrFail', () => {
    const Subject = getSubject()

    const spy_findOne = jest.spyOn(Subject, 'findOne')

    beforeAll(() => {
      // @ts-expect-error mocking
      Subject.cache = mockCache
    })

    it('should return entity', () => {
      spy_findOne.mockReturnValue(ENTITY)

      const result = Subject.findOneOrFail(ENTITY.id)

      expect(spy_findOne).toBeCalledTimes(1)
      expect(spy_findOne).toBeCalledWith(ENTITY.id, {})

      expect(result).toMatchObject(ENTITY)
    })

    it('should throw Exception if entity is not found', () => {
      const id = 'NON_EXISTENT_ENTITY_ID'

      let exception = {} as Exception

      spy_findOne.mockReturnValue(null)

      try {
        Subject.findOneOrFail(id)
      } catch (error) {
        exception = error
      }

      expect(exception.code).toBe(ExceptionStatusCode.NOT_FOUND)
      expect(exception.data).toMatchObject({ params: {} })
      expect((exception.errors as RawObject).id).toBe(id)
      expect(exception.message).toMatch(new RegExp(`"${id}" does not exist`))
    })
  })

  describe('#refreshCache', () => {
    const Subject = getSubject()

    const spy_request = jest.spyOn(Subject, 'request')

    beforeEach(() => {
      spy_request.mockReturnValue(Promise.resolve(CARS_ROOT))
    })

    it('should request repository root data', async () => {
      await Subject.refreshCache()

      expect(spy_request).toBeCalledTimes(1)
      expect(spy_request).toBeCalledWith()
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
