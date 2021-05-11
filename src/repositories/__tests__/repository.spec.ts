import { SortOrder } from '@/enums'
import type {
  AggregationStages,
  DBRequestConfig,
  IRepoValidator as IValidator
} from '@/interfaces'
import type { EntityClass, QueryParams } from '@/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { ICar } from '@tests/fixtures/cars.fixture'
import {
  Car,
  CARS,
  CARS_MOCK_CACHE as mockCache,
  CARS_MOCK_CACHE_EMPTY as mockCacheEmpty,
  CARS_ROOT
} from '@tests/fixtures/cars.fixture'
import DBCONN from '@tests/fixtures/repo-db-connection.fixture'
import merge from 'lodash.merge'
import omit from 'lodash.omit'
import type { RawObject } from 'mingo/util'
import { isType } from 'type-plus'
import TestSubject from '../repository'

/**
 * @file Unit Tests - Repository
 * @module repositories/tests/Repository
 */

jest.mock('@/providers/db-connection.provider')

const mockMerge = merge as jest.MockedFunction<typeof merge>
const mockOmit = omit as jest.MockedFunction<typeof omit>

describe('unit:repositories/Repository', () => {
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
    const Subject = new TestSubject<ICar, QueryParams<ICar>>(DBCONN, Car)

    // @ts-expect-error mocking
    Subject.cache = Object.assign({}, emptyCache ? mockCacheEmpty : mockCache)

    return Subject
  }

  describe('constructor', () => {
    it('should initialize instance properties', () => {
      const eoptions = { mingo: { idKey: 'id' }, validation: {} }

      const Subject = getSubject(EMPTY_CACHE)

      expect(Subject.cache).toMatchObject(mockCacheEmpty)
      expect(Subject.dbconn).toBe(DBCONN)
      expect(isType<EntityClass<ICar>>(Subject.model as any)).toBeTruthy()
      expect(Subject.options).toMatchObject(eoptions)
      expect(isType<IValidator<ICar>>(Subject.validator as any)).toBeTruthy()
    })
  })

  describe('#aggregate', () => {
    const Subject = getSubject()

    const stage: AggregationStages<ICar> = { $count: 'count' }

    const spy_aggregate = jest.spyOn(Subject.mingo, 'aggregate')

    it('should not call #mingo.aggregate if cache is empty', () => {
      const SubjectEC = getSubject(EMPTY_CACHE)

      const this_spy_aggregate = jest.spyOn(SubjectEC.mingo, 'aggregate')

      SubjectEC.aggregate()

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
          Subject.options.mingo
        )
      })

      it('should run pipeline with stages array', () => {
        const pipeline = [stage]

        Subject.aggregate(pipeline)

        expect(spy_aggregate).toBeCalledTimes(1)
        expect(spy_aggregate).toBeCalledWith(
          Subject.cache.collection,
          pipeline,
          Subject.options.mingo
        )
      })
    })
  })

  describe('#clear', () => {
    const Subject = getSubject()

    const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')

    it('should clear cache and database', async () => {
      spy_dbconn_send.mockImplementationOnce(async (conf?: DBRequestConfig) => {
        return conf?.data
      })

      const cleared = await Subject.clear()

      expect(cleared).toBeTruthy()

      expect(Subject.cache).toMatchObject(mockCacheEmpty)
      expect(spy_dbconn_send).toBeCalledWith({
        data: Subject.cache.root,
        method: 'put'
      })
    })

    it('should throw Exception if error is Error class type', async () => {
      let exception = {} as Exception

      try {
        spy_dbconn_send.mockImplementationOnce(() => {
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
        spy_dbconn_send.mockImplementationOnce(() => {
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

    const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')

    const dto = { ...ENTITY, id: `${ENTITY.id}-test` }

    beforeAll(() => {
      spy_dbconn_send.mockImplementation(async (config?: DBRequestConfig) => {
        if (config?.url?.includes(dto.id)) return config?.data
        return mockCache.collection
      })
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
      expect(ejson.data.dto).toMatchObject(omit(this_dto, ['created_at']))
      expect((ejson.errors as RawObject).id).toBe(this_dto.id)
      expect(ejson.message).toMatch(emessage_match)
    })

    it('should call #validator.check', async () => {
      const spy_validator_check = jest.spyOn(Subject.validator, 'check')

      await Subject.create(dto)

      expect(spy_validator_check).toBeCalledTimes(1)
    })

    it('should create new entity and call #refreshCache', async () => {
      const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')
      const spy_refreshCache = jest.spyOn(Subject, 'refreshCache')

      const result = await Subject.create(dto)

      expect(result).toMatchObject(omit(dto, ['created_at']))

      expect(spy_dbconn_send.mock.calls[0][0]?.method).toBe('put')
      expect(spy_dbconn_send.mock.calls[0][0]?.url).toBe(dto.id)

      expect(spy_refreshCache).toBeCalledTimes(1)
    })
  })

  describe('#delete', () => {
    const Subject = getSubject()

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
      const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')

      spy_dbconn_send.mockImplementationOnce(async (conf?: DBRequestConfig) => {
        return conf?.data
      })

      const ids = [ENTITY.id, NON_EXISTENT_ENTITY_ID]

      await Subject.delete(ids)

      expect(Subject.cache.collection.find(e => e.id === ENTITY.id)).toBeFalsy()
      expect(Subject.cache.root[ENTITY.id]).not.toBeDefined()

      expect(spy_dbconn_send).toBeCalledTimes(1)
      expect(spy_dbconn_send).toBeCalledWith({
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

    const spy_mingo_find = jest.spyOn(Subject.mingo, 'find')

    beforeAll(() => {
      spy_mingo_find.mockImplementation(mockFind)
    })

    it('should not call #mingo.find if cache is empty', () => {
      const SubjectEC = getSubject(EMPTY_CACHE)

      const this_spy_mingo_find = jest.spyOn(SubjectEC.mingo, 'find')
      this_spy_mingo_find.mockImplementationOnce(mockFind)

      SubjectEC.find()

      expect(SubjectEC.mingo.find).toBeCalledTimes(0)
    })

    it('should run aggregation pipeline with $project stage', () => {
      const spy_aggregate = jest.spyOn(Subject, 'aggregate')

      const params = { $project: { model: true } }

      Subject.find(params)

      expect(spy_aggregate).toBeCalledTimes(1)
      expect(spy_aggregate).toBeCalledWith({ $project: params.$project })
    })

    it('should handle query criteria', () => {
      const params = { id: Subject.cache.collection[0].id }

      Subject.find(params)

      expect(Subject.mingo.find).toBeCalledTimes(1)
      expect(Subject.mingo.find).toBeCalledWith(
        Subject.cache.collection,
        { id: params.id },
        {},
        Subject.options.mingo
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
    const Subject = getSubject()

    const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')

    beforeAll(() => {
      spy_dbconn_send.mockImplementation(async (conf?: DBRequestConfig) => {
        if (conf?.url?.includes(ENTITY.id)) return conf.data
        return mockCache.collection
      })
    })

    it('should call #findOneOrFail', async () => {
      const spy_findOneOrFail = jest.spyOn(Subject, 'findOneOrFail')

      await Subject.patch(ENTITY.id, {})

      expect(spy_findOneOrFail).toBeCalledTimes(1)
      expect(spy_findOneOrFail).toBeCalledWith(ENTITY.id)
    })

    it('should remove readonly fields from dto', async () => {
      const dto = { ...ENTITY, id: '' }

      await Subject.patch(ENTITY.id, dto)

      expect(mockMerge.mock.results[0].value.id).not.toBe(dto.id)
    })

    it('should call #validator.check', async () => {
      const spy_validator_check = jest.spyOn(Subject.validator, 'check')

      await Subject.patch(ENTITY.id, {})

      expect(spy_validator_check).toBeCalledTimes(1)
    })

    it('should update entity and call #refreshCache', async () => {
      const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')
      const spy_refreshCache = jest.spyOn(Subject, 'refreshCache')

      const dto = { make: 'MAKE' }

      await Subject.patch(ENTITY.id, dto)

      expect(spy_dbconn_send.mock.calls[0][0]?.data.make).toBe(dto.make)
      expect(spy_dbconn_send.mock.calls[0][0]?.url).toBe(ENTITY.id)

      expect(spy_refreshCache).toBeCalledTimes(1)
    })
  })

  describe('#refreshCache', () => {
    const Subject = getSubject()

    const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')

    beforeEach(() => {
      spy_dbconn_send.mockReturnValue(Promise.resolve(CARS_ROOT))
    })

    it('should request repository root data', async () => {
      await Subject.refreshCache()

      expect(spy_dbconn_send).toBeCalledTimes(1)
      expect(spy_dbconn_send).toBeCalledWith()
    })

    it('should update data cache', async () => {
      const result = await Subject.refreshCache()

      expect(result).toMatchObject({ collection: CARS, root: CARS_ROOT })
    })
  })

  describe('#save', () => {
    const Subject = getSubject()

    const DTO_BASE = { make: 'MAKE', model: 'MODEL', model_year: -1 }

    const spy_findOne = jest.spyOn(Subject, 'findOne')
    const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')

    beforeAll(() => {
      spy_dbconn_send.mockImplementation(async (conf?: DBRequestConfig) => {
        if (conf?.method === 'put') return conf.data
        return mockCache.root
      })
    })

    it('should create new entity', async () => {
      const spy_create = jest.spyOn(Subject, 'create')

      spy_findOne.mockReturnValueOnce(null)

      await Subject.save(DTO_BASE)

      expect(spy_create).toBeCalledTimes(1)
      expect(spy_create).toBeCalledWith(DTO_BASE)
    })

    it('should patch entity', async () => {
      const spy_patch = jest.spyOn(Subject, 'patch')

      spy_findOne.mockReturnValue(ENTITY)

      const dto = { ...ENTITY, ...DTO_BASE }

      await Subject.save(dto)

      expect(spy_patch).toBeCalledTimes(1)
      expect(spy_patch).toBeCalledWith(dto.id, dto)
    })
  })
})
