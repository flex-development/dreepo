import configuration from '@/config/configuration'
import { SortOrder } from '@/lib/enums'
import type { AggregationStages } from '@/lib/interfaces'
import type { NullishString, QueryParams } from '@/lib/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { AxiosRequestConfig } from 'axios'
import type { JWT } from 'google-auth-library'
import merge from 'lodash.merge'
import omit from 'lodash.omit'
import pick from 'lodash.pick'
import type { RawObject } from 'mingo/util'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import { isType } from 'type-plus'
import TestSubject from '../rtd.repository'
import type { CarEntity as ICar } from './__fixtures__/cars.fixture'
import {
  Car,
  CARS,
  CARS_ROOT,
  REPO_PATH_CARS as REPO_PATH
} from './__fixtures__/cars.fixture'

/**
 * @file Unit Tests - RTDRepository
 * @module repositories/tests/RTDRepository
 */

const mockMerge = merge as jest.MockedFunction<typeof merge>
const mockOmit = omit as jest.MockedFunction<typeof omit>

describe('unit:repositories/RTDRepository', () => {
  const { FIREBASE_DATABASE_URL, FIREBASE_RTD_REPOS_VALIDATE } = configuration()

  const mockCache = Object.freeze({ collection: CARS, root: CARS_ROOT })
  const mockCacheEmpty = Object.freeze({ collection: [], root: {} })

  const EMPTY_CACHE = true
  const ENTITY = Object.assign({}, mockCache.collection[0])
  const NON_EXISTENT_ENTITY_ID = 'NON_EXISTENT_ENTITY_ID'

  /**
   * Returns a test repository.
   *
   * If {@param emptyCache} is `true`, the repository will be initialized with
   * an empty cache. Otherwise the mockCache will be used.
   *
   * @param {boolean} [emptyCache] - Initialize with empty mock cache
   * @return {TestSubject<ICar, QueryParams<ICar>>} Test repo
   */
  const getSubject = (
    emptyCache?: boolean
  ): TestSubject<ICar, QueryParams<ICar>> => {
    const Subject = new TestSubject<ICar, QueryParams<ICar>>(REPO_PATH, Car)

    // @ts-expect-error mocking
    Subject.cache = Object.assign({}, emptyCache ? mockCacheEmpty : mockCache)

    return Subject
  }

  describe('exports', () => {
    it('should export class by default', () => {
      expect(TestSubject).toBeDefined()
      expect(TestSubject.constructor.name).toBe('Function')
    })
  })

  describe('constructor', () => {
    it('should initialize instance properties', () => {
      const Subject = getSubject(EMPTY_CACHE)

      expect(Subject.DATABASE_URL).toBe(FIREBASE_DATABASE_URL)
      expect(Subject.cache).toMatchObject(mockCacheEmpty)
      expect(Subject.http).toBeDefined()
      expect(isType<JWT>(Subject.jwt as any)).toBeTruthy()
      expect(isType<RuntypeBase<ICar>>(Subject.model as any)).toBeTruthy()
      expect(Subject.path).toBe(REPO_PATH)
      expect(Subject.validate_enabled).toBe(FIREBASE_RTD_REPOS_VALIDATE)
    })
  })

  describe('#accessToken', () => {
    const Subject = getSubject()

    // @ts-expect-error testing invocation
    const spy_jwt_authorizeAsync = jest.spyOn(Subject.jwt, 'authorizeAsync')

    it('should generate google oauth2 token', async () => {
      spy_jwt_authorizeAsync.mockReturnValueOnce(Promise.resolve('TOKEN'))

      const access_token: any = await Subject.accessToken()

      expect(isType<NullishString>(access_token)).toBeTruthy()
    })

    it('should throw Exception if #jwt.authorize throws', async () => {
      const error = new Error('Test error message')
      const jwtd = pick(Subject.jwt, ['email', 'key', 'scopes'])

      spy_jwt_authorizeAsync.mockReturnValueOnce(Promise.reject(error))

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

    const stage: AggregationStages<ICar> = { $count: 'count' }

    const spy_aggregate = jest.spyOn(Subject.mingo, 'aggregate')

    it('should not call #mingo.aggregate if cache is empty', () => {
      const ThisSubject = getSubject(EMPTY_CACHE)

      const this_spy_aggregate = jest.spyOn(ThisSubject.mingo, 'aggregate')

      ThisSubject.aggregate()

      expect(this_spy_aggregate).toBeCalledTimes(0)
    })

    it('should throw Exception if error occurs', () => {
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
        Subject.aggregate(stage)

        expect(spy_aggregate).toBeCalledTimes(1)
        expect(spy_aggregate).toBeCalledWith(
          Subject.cache.collection,
          [stage],
          Subject.mopts
        )
      })

      it('should run pipeline with stages array', () => {
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

  describe('#clear', () => {
    const Subject = getSubject()

    const mockHttp = jest.fn(async (config: AxiosRequestConfig) => {
      return { data: config.data }
    })

    const spy_request = jest.spyOn(Subject, 'request')

    beforeAll(() => {
      // @ts-expect-error mocking
      Subject.http = mockHttp
    })

    it('should clear cache and database', async () => {
      const cleared = await Subject.clear()

      expect(cleared).toBeTruthy()

      expect(Subject.cache).toMatchObject(mockCacheEmpty)
      expect(spy_request).toBeCalledWith({
        data: Subject.cache.root,
        method: 'put'
      })
    })

    it('should throw Exception if error is Error class type', async () => {
      let exception = {} as Exception

      try {
        spy_request.mockImplementationOnce(() => {
          throw new Error()
        })

        await Subject.clear()
      } catch (error) {
        exception = error
      }

      expect(exception.constructor.name).toBe('Exception')
      expect(exception.data).toMatchObject({ cache: Subject.cache })
    })

    it('should throw Exception if error is Exception class type', async () => {
      let exception = {} as Exception

      try {
        spy_request.mockImplementationOnce(() => {
          throw new Exception()
        })

        await Subject.clear()
      } catch (error) {
        exception = error
      }

      expect(exception.constructor.name).toBe('Exception')
      expect(exception.data).toMatchObject({ cache: Subject.cache })
    })
  })

  describe('#create', () => {
    const Subject = getSubject()

    const dto = { ...ENTITY, id: `${ENTITY.id}-test` }

    const mockHttp = jest.fn(async (config: AxiosRequestConfig) => {
      if (config.url?.includes(dto.id)) return { data: config.data }
      return { data: CARS }
    })

    beforeAll(() => {
      // @ts-expect-error mocking
      Subject.http = mockHttp
    })

    it('should add timestamps to dto', async () => {
      await Subject.create(dto)

      const data = mockMerge.mock.results[0].value

      expect(typeof data.created_at === 'number').toBeTruthy()
      expect(data.updated_at).toBe(undefined)
    })

    it('should assign id if dto.id is nullable or empty string', async () => {
      await Subject.create({ ...dto, id: undefined })

      const data = mockMerge.mock.results[0].value

      expect(typeof data.id === 'string').toBeTruthy()
    })

    it('should throw if entity with dto.id already exists', async () => {
      let exception = {} as Exception

      const this_dto = { ...dto, id: ENTITY.id }
      const emessage_match = new RegExp(`id "${this_dto.id}" already exists`)

      try {
        await Subject.create(this_dto)
      } catch (error) {
        exception = error
      }

      const ejson = exception.toJSON()

      expect(ejson.code).toBe(ExceptionStatusCode.CONFLICT)
      expect(ejson.data.dto).toMatchObject(this_dto)
      expect((ejson.errors as RawObject).id).toBe(this_dto.id)
      expect(ejson.message).toMatch(emessage_match)
    })

    it('should call #validate', async () => {
      const spy_validate = jest.spyOn(Subject, 'validate')

      await Subject.create(dto)

      expect(spy_validate).toBeCalledTimes(1)
    })

    it('should create new entity and call #refreshCache', async () => {
      const spy_request = jest.spyOn(Subject, 'request')
      const spy_refreshCache = jest.spyOn(Subject, 'refreshCache')

      const result = await Subject.create(dto)

      expect(result).toMatchObject(omit(dto, ['created_at']))

      expect(spy_request.mock.calls[0][0]?.method).toBe('put')
      expect(spy_request.mock.calls[0][0]?.url).toBe(dto.id)

      expect(spy_refreshCache).toBeCalledTimes(1)
    })
  })

  describe('#delete', () => {
    const Subject = getSubject()

    const mockHttp = jest.fn(async (config: AxiosRequestConfig) => {
      return { data: config.data }
    })

    beforeAll(() => {
      // @ts-expect-error mocking
      Subject.http = mockHttp
    })

    it('should throw if any entity does not exist but should', async () => {
      const SHOULD_EXIST = true
      const ids = [NON_EXISTENT_ENTITY_ID]

      let exception = {} as Exception

      try {
        await Subject.delete(ids, SHOULD_EXIST)
      } catch (error) {
        exception = error
      }

      const ejson = exception.toJSON()

      expect(ejson.code).toBe(ExceptionStatusCode.NOT_FOUND)
      expect(ejson.data).toMatchObject({ ids, should_exist: SHOULD_EXIST })
    })

    it('should filter out ids of entities that do not exist', async () => {
      const ids = [NON_EXISTENT_ENTITY_ID]

      const result = await Subject.delete(ids)

      expect(mockOmit).toBeCalledWith(Subject.cache.root, [])
      expect(result).toBeArray({ length: 0 })
    })

    it('should remove entities from cache and database', async () => {
      const spy_request = jest.spyOn(Subject, 'request')

      const ids = [ENTITY.id, NON_EXISTENT_ENTITY_ID]

      await Subject.delete(ids)

      expect(Subject.cache.collection.find(e => e.id === ENTITY.id)).toBeFalsy()
      expect(Subject.cache.root[ENTITY.id]).not.toBeDefined()

      expect(spy_request).toBeCalledTimes(1)
      expect(spy_request).toBeCalledWith({
        data: Subject.cache.root,
        method: 'put'
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
      const ThisSubject = getSubject(EMPTY_CACHE)

      ThisSubject.mingo.find = mockFind

      ThisSubject.find()

      expect(ThisSubject.mingo.find).toBeCalledTimes(0)
    })

    it('should handle query criteria', () => {
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
      const params = { $sort: { id: SortOrder.ASCENDING } }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(mockCursor.sort).toBeCalledWith(params.$sort)
    })

    it('should offset results', () => {
      const params = { $skip: 2 }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(mockCursor.skip).toBeCalledWith(params.$skip)
    })

    it('should limit results', () => {
      const params = { $limit: 1 }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(mockCursor.limit).toBeCalledWith(params.$limit)
    })

    it('should run aggregation pipeline with $project stage', () => {
      const spy_aggregate = jest.spyOn(Subject, 'aggregate')

      const params = { $project: { model: true } }

      Subject.find(params)

      expect(spy_aggregate).toBeCalledTimes(1)
      expect(spy_aggregate).toBeCalledWith({ $project: params.$project })
    })

    it('should throw Exception if error occurs', () => {
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
        expect(exception.data).toMatchObject({ ids: [], params: {} })
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
        expect(exception.data).toMatchObject({ ids: [], params: {} })
      })
    })
  })

  describe('#findOne', () => {
    const Subject = getSubject()

    const spy_find = jest.spyOn(Subject, 'find')

    it('should return entity', () => {
      spy_find.mockReturnValue([ENTITY])

      const result = Subject.findOne(ENTITY.id)

      expect(spy_find).toBeCalledTimes(1)
      expect(spy_find).toBeCalledWith({ id: ENTITY.id })

      expect(result).toMatchObject(ENTITY)
    })

    it('should return null if entity is not found', () => {
      const id = NON_EXISTENT_ENTITY_ID

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

    it('should return entity', () => {
      spy_findOne.mockReturnValue(ENTITY)

      const result = Subject.findOneOrFail(ENTITY.id)

      expect(spy_findOne).toBeCalledTimes(1)
      expect(spy_findOne).toBeCalledWith(ENTITY.id, {})

      expect(result).toMatchObject(ENTITY)
    })

    it('should throw Exception if entity is not found', () => {
      const id = NON_EXISTENT_ENTITY_ID

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

  describe('#patch', () => {
    it.todo('should call #findOneOrFail')

    it.todo('should remove readonly fields from dto')

    it.todo('should call #validate')

    it.todo('should update entity and call #refreshCache')
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

  describe('#validate', () => {
    const Subject = getSubject()

    const spy_model_check = jest.spyOn(Subject.model, 'check')

    it('should call #model.check if schema validation is enabled', () => {
      Subject.validate(ENTITY)

      expect(spy_model_check).toBeCalledTimes(1)
    })

    it('should not call #model.check if schema validation is disabled', () => {
      const ThisSubject = getSubject()

      // @ts-expect-error mocking
      ThisSubject.validate_enabled = false

      const this_model_check = jest.spyOn(ThisSubject.model, 'check')

      const value = {}
      const result = ThisSubject.validate(value)

      expect(result).toMatchObject(value)
      expect(this_model_check).toBeCalledTimes(0)
    })

    it('should return value if validation passes', () => {
      expect(Subject.validate(ENTITY)).toMatchObject(ENTITY)
    })

    it('should throw Exception if validation fails', () => {
      const value = {}

      let exception = {} as Exception

      try {
        Subject.validate(value)
      } catch (error) {
        exception = error
      }

      const ejson = exception.toJSON()

      expect(ejson.code).toBe(ExceptionStatusCode.BAD_REQUEST)
      expect(ejson.data.failcode).toBeDefined()
      expect(ejson.data.value).toMatchObject(value)
      expect(ejson.errors).toBePlainObject()
      expect(ejson.message.length).toBeTruthy()
    })
  })
})
