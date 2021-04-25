import axios from '@/config/axios'
import configuration from '@/config/configuration'
import type { EntityDTO } from '@/lib/dto/entity.dto'
import type { DBRequestConfig, IEntity, IRTDRepository } from '@/lib/interfaces'
import type { OneOrMany, PartialOr, RTDRepoHttpClient } from '@/lib/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import { JWT } from 'google-auth-library'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import type { PlainObject } from 'simplytyped'

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
  P extends PlainObject = PlainObject
> implements IRTDRepository {
  /**
   * @readonly
   * @instance
   * @property {string} DATABASE_URL - Firebase Realtime Database URL
   */
  readonly DATABASE_URL: string

  /**
   * @readonly
   * @instance
   * @property {RTDRepoHttpClient} http - HTTP client used to request REST API
   */
  readonly http: RTDRepoHttpClient

  /**
   * @readonly
   * @instance
   * @property {JWT} jwt - JWT client authenticated with service account
   */
  readonly jwt: JWT

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
   * @property {boolean} validate - If `true`, validate DTOs before creating or
   * updating an entity. Otherwise, perform operation without validating schema
   */
  readonly validate: boolean

  /**
   * Instantiates a new Realtime Database repository.
   *
   * @param {string} path - Database repository path
   * @param {RuntypeBase<E>} model - Entity schema model
   * @param {RTDRepoHttpClient} [http] - HTTP client. Defaults to `axios`
   */
  constructor(
    path: string,
    model: RuntypeBase<E>,
    http: RTDRepoHttpClient = axios
  ) {
    // Environment variables
    const {
      FIREBASE_CLIENT_EMAIL: client_email,
      FIREBASE_DATABASE_URL,
      FIREBASE_PRIVATE_KEY: private_key,
      FIREBASE_RTD_REPOS_VALIDATE: validate
    } = configuration()

    // Required scopes to generate Google OAuth2 access token
    const scopes = [
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/userinfo.email'
    ]

    this.DATABASE_URL = FIREBASE_DATABASE_URL
    this.http = http
    this.jwt = new JWT(client_email, undefined, private_key, scopes)
    this.model = model
    this.path = path
    this.validate = validate
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
   * Finds entities that match given options.
   *
   * @async
   * @param {P} params - Query parameters
   * @return {Promise<PartialOr<E>[]>} Promise with matching entities
   * @throws {Exception}
   */
  async find(params: P = {} as P): Promise<PartialOr<E>[]> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }

  /**
   * Finds multiple entities by id.
   *
   * @async
   * @param {string[]} ids - ID of entities to find
   * @param {P} params - Query parameters
   * @return {Promise<PartialOr<E>[]>} Promise with matching entities
   * @throws {Exception}
   */
  async findByIds(
    ids: E['id'][],
    params: P = {} as P
  ): Promise<PartialOr<E>[]> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }

  /**
   * Finds an entity by ID.
   *
   * Returns `null` if the entity isn't found.
   *
   * @async
   * @param {string} id - ID of entity to find
   * @param {P} params - Query parameters
   * @return {Promise<PartialOr<E> | null>} Promise with entity or null
   * @throws {Exception}
   */
  async findOne(
    id: E['id'],
    params: P = {} as P
  ): Promise<PartialOr<E> | null> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
  }

  /**
   * Finds an entity by ID.
   *
   * Throws an error if the entity isn't found.
   *
   * @async
   * @param {string} id - ID of entity to find
   * @param {P} params - Query parameters
   * @return {Promise<PartialOr<E>>} Promise with entity or null
   * @throws {Exception}
   */
  async findOneOrFail(id: E['id'], params: P = {} as P): Promise<PartialOr<E>> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
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
   * Executes a query.
   *
   * @async
   * @param {P} params - Query parameters
   * @throws {Exception}
   */
  async query(params: P = {} as P): Promise<PartialOr<E>[]> {
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
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
    throw new Exception(
      ExceptionStatusCode.NOT_IMPLEMENTED,
      'Method not implemented'
    )
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
}
