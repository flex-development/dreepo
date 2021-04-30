import axios from '@/config/axios'
import configuration from '@/config/configuration'
import logger from '@/config/logger'
import mingo from '@/config/mingo'
import type { EntityDTO } from '@/lib/dto/entity.dto'
import { SortOrder } from '@/lib/enums/sort-order.enum'
import type {
  AggregationStages,
  DBRequestConfig,
  IEntity,
  IRTDRepository,
  MingoOptions
} from '@/lib/interfaces'
import type {
  EntityEnhanced,
  EntityPath,
  OneOrMany,
  PartialOr,
  ProjectionCriteria,
  ProjectStage,
  QueryParams,
  RepoCache,
  RepoHttpClient,
  RepoRoot
} from '@/lib/types'
import databaseToken from '@/lib/utils/databaseToken.util'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { AxiosRequestConfig } from 'axios'
import type { Debugger } from 'debug'
import isEmpty from 'lodash.isempty'
import isPlainObject from 'lodash.isplainobject'
import merge from 'lodash.merge'
import omit from 'lodash.omit'
import uniq from 'lodash.uniq'
import type { RawArray, RawObject } from 'mingo/util'
import { ValidationError } from 'runtypes/lib/errors'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import { v4 as uuid } from 'uuid'

/**
 * @file Repositories - RTDRepository
 * @module repositories/RTD
 */

/**
 * Repository API for Firebase Realtime Database.
 * Uses the Firebase Database REST API to perform CRUD operations.
 *
 * A Realtime Database repository is a JSON object located at a database path.
 *
 * @template E - Entity
 * @template P - Query parameters
 *
 * @class RTDRepository
 */
export default class RTDRepository<
  E extends IEntity = IEntity,
  P extends QueryParams<E> = QueryParams<E>
> implements IRTDRepository<E, P> {
  /**
   * @readonly
   * @instance
   * @property {string} DATABASE_URL - Firebase Realtime Database URL
   */
  readonly DATABASE_URL: string

  /**
   * @readonly
   * @instance
   * @property {RepoCache} cache - Repository data cache
   */
  readonly cache: RepoCache<E>

  /**
   * @readonly
   * @instance
   * @property {RepoHttpClient} http - HTTP client used to request REST API
   */
  readonly http: RepoHttpClient

  /**
   * @readonly
   * @instance
   * @property {Debugger} logger - Internal logger
   */
  readonly logger: Debugger = logger.extend('RTDRepository')

  /**
   * @readonly
   * @instance
   * @property {typeof mingo} mingo - MongoDB query language client
   */
  readonly mingo: typeof mingo = mingo

  /**
   * @readonly
   * @instance
   * @property {MingoOptions} mopts - Global Mingo options
   */
  readonly mopts: MingoOptions = { idKey: 'id' }

  /**
   * @readonly
   * @instance
   * @property {RuntypeBase<E>} model - Entity schema model
   */
  readonly model: RuntypeBase<E>

  /**
   * @readonly
   * @instance
   * @property {string} path - Repository database path
   */
  readonly path: string

  /**
   * @readonly
   * @instance
   * @property {boolean} validate_enabled - If `true`, validate DTOs before
   * creating or updating an entity. Otherwise, perform operation without
   * validating schema
   */
  readonly validate_enabled: boolean

  /**
   * Instantiates a new Realtime Database repository.
   *
   * @param {string} path - Database repository path
   * @param {RuntypeBase<E>} model - Entity schema model
   * @param {RepoHttpClient} [http] - HTTP client. Defaults to `axios`
   */
  constructor(
    path: string,
    model: RuntypeBase<E>,
    http: RepoHttpClient = axios
  ) {
    // Environment variables
    const {
      FIREBASE_DATABASE_URL,
      FIREBASE_RTD_REPOS_VALIDATE: validate_enabled
    } = configuration()

    this.DATABASE_URL = FIREBASE_DATABASE_URL
    this.cache = { collection: [], root: {} }
    this.http = http
    this.model = model
    this.path = path
    this.validate_enabled = validate_enabled
  }

  /**
   * Runs an aggregation pipeline for `this.cache.collection`.
   *
   * If the cache is empty, a warning will be logged to the console instructing
   * developers to call {@method RTDRepository#refreshCache}.
   *
   * @param {OneOrMany<AggregationStages<E>>} pipeline - Aggregation stage(s)
   * @return {Array<PartialOr<EntityEnhanced<E>>> | RawArray} Pipeline results
   * @throws {Exception}
   */
  aggregate(
    pipeline: OneOrMany<AggregationStages<E>> = []
  ): PartialOr<EntityEnhanced<E>>[] | RawArray {
    const { collection } = this.cache

    if (!collection.length) {
      this.logger(`Repository at path "${this.path}" empty.`)
      this.logger('Consider calling #refreshCache before running pipeline.')

      return collection
    }

    let _pipeline = pipeline as RawObject[]
    if (!Array.isArray(_pipeline)) _pipeline = [_pipeline]

    try {
      return this.mingo.aggregate(collection, _pipeline, this.mopts)
    } catch ({ message, stack }) {
      const data = { pipeline: _pipeline }

      throw new Exception(ExceptionStatusCode.BAD_REQUEST, message, data, stack)
    }
  }

  /**
   * Clears all data from the repository.
   *
   * @async
   * @return {Promise<true>} Promise with `true` indicating data was removed
   * @throws {Exception}
   */
  async clear(): Promise<true> {
    try {
      // ! Update cache
      Object.assign(this.cache, { collection: [], root: {} })

      // ! Clear database
      await this.request<RepoRoot<E>>({ data: this.cache.root, method: 'put' })
    } catch (error) {
      const data = { cache: this.cache }

      if (error.constructor.name === 'Exception') {
        error.data = merge(error.data, data)
        throw error
      }

      const code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      const { message, stack } = error

      throw new Exception(code, message, data, stack)
    }

    return true
  }

  /**
   * Creates a new entity.
   *
   * The entity will be timestamped and assigned an UUID if {@param dto.id} is
   * nullable or an empty string.
   *
   * Throws an error if an entity with the same `id` exists, or if schema
   * validation is enabled and fails.
   *
   * References:
   *
   * - https://firebase.google.com/docs/reference/rest/database#section-put
   * - https://github.com/uuidjs/uuid
   *
   * @async
   * @param {EntityDTO<E>} dto - Data to create new entity
   * @return {Promise<E>} Promise with new entity
   * @throws {Exception}
   */
  async create(dto: EntityDTO<E>): Promise<E> {
    try {
      let data = merge(dto, {
        created_at: Date.now(),
        id: isEmpty(dto.id) ? uuid() : `${dto.id}`.trim(),
        updated_at: undefined
      }) as E

      // Check if another entity with the same `id` already exists
      if (this.findOne(data.id)) {
        const message = `Entity with id "${data.id}" already exists`
        const edata = { dto: data, errors: { id: data.id } }

        throw new Exception(ExceptionStatusCode.CONFLICT, message, edata)
      }

      // Validate DTO schema
      data = this.validate<E>(data)

      // Create new entity
      data = await this.request<E>({ data, method: 'put', url: data.id })

      // ! Refresh cache
      await this.refreshCache()

      return data
    } catch (error) {
      if (error.constructor.name === 'Exception') throw error

      const code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      const { message, stack } = error

      throw new Exception(code, message, { dto }, stack)
    }
  }

  /**
   * Deletes a single entity or group of entities.
   *
   * If {@param should_exist} is `true`, an error will be thrown if the entity
   * or one of the entities doesn't exist.
   *
   * @async
   * @param {OneOrMany<string>} id - Entity ID or array of IDs
   * @param {boolean} [should_exist] - Throw if any entities don't exist
   * @return {Promise<string[]>} Promise with array of deleted entity IDs
   * @throws {Exception}
   */
  async delete(
    id: OneOrMany<E['id']>,
    should_exist: boolean = false
  ): Promise<string[]> {
    let _ids = Array.isArray(id) ? id : [id]

    try {
      // Check if all entities exist or filter our non-existent entities
      if (should_exist) _ids.forEach(id => this.findOneOrFail(id))
      else _ids = _ids.filter(id => this.findOne(id))

      // Get repository root data from cache
      let root = Object.assign({}, this.cache.root)

      // ! Remove entities and update cache
      root = omit(root, _ids)
      Object.assign(this.cache, { collection: Object.values(root), root })

      // ! Remove entities from database
      await this.request<RepoRoot<E>>({ data: this.cache.root, method: 'put' })

      return _ids
    } catch (error) {
      const data = { ids: _ids, should_exist }

      if (error.constructor.name === 'Exception') {
        error.data = merge(error.data, data)
        throw error
      }

      const code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      const { message, stack } = error

      throw new Exception(code, message, data, stack)
    }
  }

  /**
   * Performs a query on `this.cache.collection`.
   *
   * If the cache is empty, a warning will be logged to the console instructing
   * developers to call {@method RTDRepository#refreshCache}.
   *
   * @param {P} [params] - Query parameters
   * @param {number} [params.$limit] - Limit number of results
   * @param {ProjectStage<E>} [params.$project] - Fields to include
   * @param {number} [params.$skip] - Skips the first n entities
   * @param {Record<EntityPath<E>, SortOrder>} [params.$sort] - Sorting rules
   * @param {ProjectionCriteria<E>} [params.projection] - Projection operators
   * @return {PartialOr<E>[]} Search results
   * @throws {Exception}
   */
  find(params: P = {} as P): PartialOr<E>[] {
    const {
      $limit,
      $project = {},
      $skip,
      $sort,
      projection = {},
      ...criteria
    } = params
    const { collection } = this.cache

    if (!collection.length) {
      this.logger(`Repository at path "${this.path}" empty.`)
      this.logger('Consider calling #refreshCache before performing search.')

      return collection
    }

    try {
      // Handle query criteria
      let cursor = this.mingo.find(collection, criteria, projection, this.mopts)

      // Apply sorting rules
      if ($sort && !isEmpty($sort)) cursor = cursor.sort($sort)

      // Apply offset
      if (typeof $skip === 'number') cursor = cursor.skip($skip)

      // Limit results
      if (typeof $limit === 'number') cursor = cursor.limit($limit)

      // Get entities
      let entities = cursor.all() as PartialOr<E>[]

      // Pick entity fields from each entity
      if ($project && !isEmpty($project)) {
        entities = this.aggregate({ $project }) as PartialOr<E>[]
      }

      // Return search results
      return entities
    } catch ({ message, stack }) {
      const data = { params, projection }

      throw new Exception(ExceptionStatusCode.BAD_REQUEST, message, data, stack)
    }
  }

  /**
   * Finds multiple entities by id.
   *
   * @param {string[]} [ids] - Array of entity IDs
   * @param {P} [params] - Query parameters
   * @return {PartialOr<E>[]} Search results
   * @throws {Exception}
   */
  findByIds(ids: E['id'][] = [], params: P = {} as P): PartialOr<E>[] {
    try {
      // Perform search
      const entities = this.find(params)

      // Get specified entities
      return entities.filter(entity => ids.includes(entity.id as string))
    } catch (error) {
      const data = { ids, params }

      if (error.constructor.name === 'Exception') {
        error.data = merge(error.data, data)
        throw error
      }

      const { message, stack } = error

      throw new Exception(ExceptionStatusCode.BAD_REQUEST, message, data, stack)
    }
  }

  /**
   * Finds an entity by ID.
   *
   * Returns `null` if the entity isn't found.
   *
   * @async
   * @param {string} id - ID of entity to find
   * @param {P} [params] - Query parameters
   * @return {PartialOr<E> | null} Promise with entity or null
   * @throws {Exception}
   */
  findOne(id: E['id'], params: P = {} as P): PartialOr<E> | null {
    // Perform search
    const entities = this.find({ ...params, id })
    const entity = entities[0]

    // Return entity or null if not found
    return entity?.id === id ? entity : null
  }

  /**
   * Finds an entity by ID.
   *
   * Throws an error if the entity isn't found.
   *
   * @async
   * @param {string} id - ID of entity to find
   * @param {P} [params] - Query parameters
   * @return {PartialOr<E>} Promise with entity or null
   * @throws {Exception}
   */
  findOneOrFail(id: E['id'], params: P = {} as P): PartialOr<E> {
    const entity = this.findOne(id, params)

    if (!entity) {
      const message = `Entity with id "${id}" does not exist`
      const data = { errors: { id }, params }

      throw new Exception(ExceptionStatusCode.NOT_FOUND, message, data)
    }

    return entity
  }

  /**
   * Partially updates an entity.
   *
   * The entity's `created_at` and `id` properties cannot be patched.
   *
   * Throws an error if the entity isn't found, or if schema validation is
   * enabled and fails.
   *
   * @async
   * @param {string} id - ID of resource to update
   * @param {Partial<EntityDTO<E>>} dto - Data to patch entity
   * @param {string[]} [rfields] - Additional readonly fields
   * @return {Promise<E>} Promise containing updated entity
   * @throws {Exception}
   */
  async patch(
    id: E['id'],
    dto: Partial<EntityDTO<E>>,
    rfields: string[] = []
  ): Promise<E> {
    // Make sure entity exists
    const entity = this.findOneOrFail(id)

    try {
      // Get readonly properties
      const _rfields = uniq(['created_at', 'id', 'updated_at'].concat(rfields))

      // Remove readonly properties from dto
      dto = omit(dto, _rfields)

      // Merge existing data and update `updated_at` timestamp
      let data = merge(entity, { ...dto, updated_at: Date.now() }) as E

      // Validate DTO schema
      data = this.validate<E>(data)

      // Update entity
      data = await this.request<E>({ data, method: 'put', url: data.id })

      // ! Refresh cache
      await this.refreshCache()

      return data
    } catch (error) {
      if (error.constructor.name === 'Exception') throw error

      const code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      const { message, stack } = error

      /* eslint-disable-next-line sort-keys */
      throw new Exception(code, message, { id, dto, rfields }, stack)
    }
  }

  /**
   * Refreshes the repository data cache.
   *
   * Should be called when a repository is first instantiated, or when an entity
   * is created or updated.
   *
   * @async
   * @return {Promise<RepoCache<E>>} Updated repository cache
   * @throws {Exception}
   */
  async refreshCache(): Promise<RepoCache<E>> {
    try {
      // Require repository root data
      const root = await this.request<RepoRoot<E>>()

      // Get entities
      const collection = Object.values(root)

      // Update cache
      Object.assign(this.cache, { collection, root })

      return this.cache
    } catch (error) {
      if (error.constructor.name === 'Exception') throw error

      const code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      const { message, stack } = error

      throw new Exception(code, message, {}, stack)
    }
  }

  /**
   * Sends requests to the Firebase Database REST API.
   *
   * To bypass Realtime Database Rules, requests will be authenticated with a
   * Google OAuth2 token, thus granting the server admin database privileges.
   *
   * To use `process.env.FIREBASE_DATBASE_URL` as a REST endpoint, the request
   * URL, {@param config.url} will have `.json` appended.
   *
   * @template T - Payload type
   *
   * @async
   * @param {DBRequestConfig} config - Axios request config
   * @return {Promise<T>} Promise containing response payload
   * @throws {Exception}
   */
  async request<T = any>(config: DBRequestConfig = {}): Promise<T> {
    const $config: AxiosRequestConfig = {
      ...config,
      baseURL: `${this.DATABASE_URL}/${this.path}`,
      params: {
        ...(isPlainObject(config.params) ? config.params : {}),
        access_token: await databaseToken(),
        print: 'pretty'
      },
      url: `/${(config.url || '').trim()}.json`
    }

    // Make request
    const response = await this.http($config)

    // ! If repository root is empty, null will be returned
    if ($config?.url === '/.json') return (response?.data ?? {}) as T

    // Return response data or response object if no data
    return response?.data ?? response
  }

  /**
   * Creates or updates a single entity or array of entities.
   *
   * If the entity already exists in the database, it will be updated.
   * If the entity does not exist in the database, it will be inserted.
   *
   * @async
   * @param {OneOrMany<PartialOr<EntityDTO<E>>>} dto - Entities to upsert
   * @return {Promise<E[]>} Promise with new or updated entities
   */
  async save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<E[]> {
    /**
     * Creates or updates a single entity.
     *
     * If the entity already exists in the database, it will be updated.
     * If the entity does not exist in the database, it will be inserted.
     *
     * @async
     * @param {PartialOr<EntityDTO<E>>} dto - Data to upsert entity
     * @return {Promise<E>} Promise with new or updated entiy
     */
    const upsert = async (dto: PartialOr<EntityDTO<E>>): Promise<E> => {
      const { id = '' } = dto

      const exists = this.findOne(id)

      if (!exists) return await this.create(dto as EntityDTO<E>)
      return await this.patch(id, dto)
    }

    // Convert into array of DTOs
    const dtos = Array.isArray(dto) ? dto : [dto]

    // Perform upsert
    return await Promise.all(dtos.map(async d => upsert(d)))
  }

  /**
   * Validates {@param value} against {@see RTDRepository#model} if schema
   * validation is enabled. If disabled, the original value will be returned.
   *
   * References:
   *
   * - https://github.com/pelotom/runtypes
   *
   * @template V - Type of value being validated
   *
   * @param {V} value - Data to validate
   * @return {E | V} - Validated object or original value
   * @throws {Exception}
   */
  validate<V extends unknown = RawObject>(value: V = {} as V): E | V {
    if (!this.validate_enabled) return value

    try {
      return this.model.check(value)
    } catch (error) {
      let code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      let data = { value }

      if (error.name === 'ValidationError') {
        const { code: failcode, details } = error as ValidationError

        code = ExceptionStatusCode.BAD_REQUEST
        data = merge(data, { errors: details, failcode })
      }

      throw new Exception(code, error.message, data, error.stack)
    }
  }
}
