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
  NullishString,
  OneOrMany,
  PartialOr,
  ProjectionCriteria,
  ProjectStage,
  QueryParams,
  RepoCache,
  RepoHttpClient,
  RepoRoot
} from '@/lib/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { AxiosRequestConfig } from 'axios'
import type { Debugger } from 'debug'
import { JWT } from 'google-auth-library'
import isEmpty from 'lodash.isempty'
import isPlainObject from 'lodash.isplainobject'
import pick from 'lodash.pick'
import type { RawArray, RawObject } from 'mingo/util'
import type { RuntypeBase } from 'runtypes/lib/runtype'

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
   * @property {string} ENV - Node environment
   */
  readonly ENV: string

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
   * @property {JWT} jwt - JWT client authenticated with service account
   */
  readonly jwt: JWT

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
      FIREBASE_CLIENT_EMAIL: client_email,
      FIREBASE_DATABASE_URL,
      FIREBASE_PRIVATE_KEY: private_key,
      FIREBASE_RTD_REPOS_VALIDATE: validate_enabled,
      NODE_ENV
    } = configuration()

    // Required scopes to generate Google OAuth2 access token
    const scopes = [
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/userinfo.email'
    ]

    this.DATABASE_URL = FIREBASE_DATABASE_URL
    this.ENV = NODE_ENV
    this.cache = { collection: [], root: {} }
    this.http = http
    this.jwt = new JWT(client_email, undefined, private_key, scopes)
    this.model = model
    this.path = path
    this.validate_enabled = validate_enabled
  }

  /**
   * Generates a Google OAuth2 access token with the following scopes:
   *
   * - `https://www.googleapis.com/auth/firebase.database`
   * - `https://www.googleapis.com/auth/userinfo.email`
   *
   * The token can be used to send authenticated, admin-level requests to the
   * Firebase Database REST API.
   *
   * References:
   *
   * - https://firebase.google.com/docs/database/rest/auth
   *
   * @async
   * @return {Promise<NullishString>} Promise with access token or null
   * @throws {Exception}
   */
  async accessToken(): Promise<NullishString> {
    try {
      // @ts-expect-error prefer to use async method
      return (await this.jwt.authorizeAsync()).access_token || null
    } catch ({ message, stack }) {
      throw new Exception(
        ExceptionStatusCode.UNAUTHORIZED,
        message,
        pick(this.jwt, ['email', 'key', 'scopes']),
        stack
      )
    }
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
   * @return {Promise<boolean>} Promise with boolean indicating data was removed
   * @throws {Exception}
   */
  async clear(): Promise<boolean> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }

  /**
   * Creates a new entity.
   * The entity will be timestamped and assigned an UUID.
   *
   * Throws an error if an entity with the same `id` exists, or if model
   * validation is enabled and fails.
   *
   * @async
   * @param {EntityDTO<E>} dto - Data to create new entity
   * @return {Promise<E>} Promise with new entity
   * @throws {Exception}
   */
  async create(dto: EntityDTO<E>): Promise<E> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }

  /**
   * Deletes a single entity or group of entities.
   *
   * Throws an error if the entity or one of the entities doesn't exist.
   *
   * @async
   * @param {OneOrMany<string>} id - Entity ID or array of IDs
   * @return {Promise<OneOrMany<string>>} Promise with ID of deleted entity or
   * array of deleted entity IDs
   * @throws {Exception}
   */
  async delete(id: OneOrMany<E['id']>): Promise<typeof id> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
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
      if (error.constructor.name === 'Exception') throw error

      const { message, stack } = error
      const data = { ids, params }

      throw new Exception(ExceptionStatusCode.BAD_REQUEST, message, data, stack)
    }
  }

  /**
   * Finds an entity by ID.
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
   * The entity's `created_at` and `id` properties cannot be patched.
   *
   * Throws an error if the entity isn't found, or if model validation is
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
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }

  /**
   * Refreshes the repository data cache.
   *
   * Should be called when a repository is first instantiated, or when an entity
   * is created or updated.
   *
   * @async
   * @return {Promise<RepoCache<E>>} Updated data cache
   */
  async refreshCache(): Promise<RepoCache<E>> {
    // Require repository root data
    const root = await this.request<RepoRoot<E>>()

    // Get entities
    const collection = Object.values(root)

    // Update data cache
    Object.assign(this.cache, { collection, root })

    return this.cache
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
        access_token: await this.accessToken(),
        print: 'pretty'
      },
      url: `/${config.url || ''}.json`
    }

    return (await this.http($config)).data as T
  }

  /**
   * Creates or updates a single entity or array of entities.
   *
   * If the entity already exists in the database, it will be updated.
   * If the entity does not exist in the database, it will be inserted.
   *
   * @async
   * @param {OneOrMany<PartialOr<EntityDTO<E>>>} dto - Entities to upsert
   * @return {Promise<OneOrMany<E>>} Promise with new entity or entities
   * @throws {Exception}
   */
  async save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<OneOrMany<E>> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }

  /**
   * Validates {@param value} against the {@see RTDRepository#model} if schema
   * validation is enabled. If disabled, the original value will be returned.
   *
   * @param {RawObject} value - Data to validate
   * @return {E | typeof value} - Validated object or original value
   * @throws {Exception}
   */
  validate(value: RawObject = {}): E | typeof value {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }
}
