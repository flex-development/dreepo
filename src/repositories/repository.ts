import logger from '@/config/logger'
import type { IEntity, IRepoDBConnection, IRepository } from '@/interfaces'
import type { RepoParsedUrlQuery, RepoRoot, RepoSearchParams } from '@/types'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import { MangoRepositoryAsync } from '@flex-development/mango'
import type {
  CreateEntityDTO,
  EntityDTO,
  MangoRepoOptionsDTO,
  PatchEntityDTO
} from '@flex-development/mango/dtos'
import type {
  MangoCacheRepo,
  MangoParserOptions,
  MangoValidatorOptions,
  MingoOptions
} from '@flex-development/mango/interfaces'
import type { DUID } from '@flex-development/mango/types'
import type { OneOrMany } from '@flex-development/tutils'
import type { ClassType } from 'class-transformer-validator'
import type { Debugger } from 'debug'
import merge from 'lodash.merge'
import pick from 'lodash.pick'

/**
 * @file Repositories - Repository
 * @module repositories/Repository
 */

/**
 * Repository API for Firebase Realtime Database.
 * Uses the Firebase Database REST API to perform CRUD operations.
 *
 * A Realtime Database repository is a JSON object located at a database path.
 *
 * @template E - Entity
 * @template P - Repository search parameters (query criteria and options)
 * @template Q - ParsedURL query object
 *
 * @class
 * @extends MangoRepositoryAsync
 * @implements {IRepository<E, P, Q>}
 */
export default class Repository<
    E extends IEntity = IEntity,
    P extends RepoSearchParams<E> = RepoSearchParams<E>,
    Q extends RepoParsedUrlQuery<E> = RepoParsedUrlQuery<E>
  >
  extends MangoRepositoryAsync<E, DUID, P, Q>
  implements IRepository<E, P, Q> {
  /**
   * @readonly
   * @instance
   * @property {IRepoDBConnection} dbconn - Database connection provider
   */
  readonly dbconn: IRepoDBConnection

  /**
   * @readonly
   * @instance
   * @property {Debugger} logger - Internal logger
   */
  readonly logger: Debugger = logger.extend('repo')

  /**
   * Instantiates a new Realtime Database repository.
   *
   * See:
   *
   * - https://github.com/flex-development/mango
   *
   * @param {IRepoDBConnection} dbconn - Database connection provider
   * @param {ClassType<E>} model - Entity model
   * @param {MangoRepoOptionsDTO<E, DUID>} [options] - Repository options
   * @param {MingoOptions<DUID>} [options.mingo] - Global mingo options
   * @param {MangoParserOptions<E>} [options.parser] - MangoParser options
   * @param {MangoValidatorOptions} [options.validation] - Validation options
   */
  constructor(
    dbconn: IRepoDBConnection,
    model: ClassType<E>,
    options: MangoRepoOptionsDTO<E> = {}
  ) {
    super(model, options)
    this.dbconn = dbconn
  }

  /**
   * Initializes the cache with data from the repository root.
   * Should be called when a repository is first instantiated.
   *
   * @async
   * @return {Promise<MangoCacheRepo<E>>} Initialized repository cache
   */
  async cacheInit(): Promise<MangoCacheRepo<E>> {
    // Require repository root data
    const root = await this.dbconn.send<RepoRoot<E>>()

    // Reset cache
    await this.setCache(Object.values(root))

    return this.cache
  }

  /**
   * Pushes data from the repository cache into the database repository.
   * Any data in the repository will be overwritten.
   *
   * References:
   *
   * - https://firebase.google.com/docs/reference/rest/database#section-put
   *
   * @async
   * @return {Promise<RepoRoot<E>>} Promise containing updated repository root
   */
  async cacheSync(): Promise<RepoRoot<E>> {
    return await this.dbconn.send<RepoRoot<E>>({
      data: this.cache.root,
      method: 'put'
    })
  }

  /**
   * Clears all data from the repository.
   *
   * @async
   * @return {Promise<true>} Promise containing `true`
   */
  async clear(): Promise<true> {
    // Clear in-memory repository
    await super.clear()

    // Clear database repository
    await this.cacheSync()

    return true
  }

  /**
   * Creates a new entity.
   *
   * The entity will be timestamped and assigned a unique identifier (uid) if
   * {@param dto.id} is nullable or an empty string.
   *
   * Throws a `400 BAD_REQUEST` error if schema validation is enabled and fails.
   * Throws a `409 CONFLICT` error if an entity with the same `id` exists.
   *
   * @async
   * @param {CreateEntityDTO<E>} dto - Data to create new entity
   * @return {Promise<E>} Promise containing new entity
   * @throws {Exception}
   */
  async create(dto: CreateEntityDTO<E>): Promise<E> {
    try {
      // Add timestamps to dto and attempt insert into in-memory repository
      const entity = await super.create({
        ...dto,
        created_at: Date.now(),
        updated_at: undefined
      })

      // Create new entity in database repository and return new entity
      return (await this.cacheSync())[entity.id]
    } catch (error) {
      const exception = error as Exception

      exception.data.dto = dto

      throw exception
    }
  }

  /**
   * Deletes a single entity or group of entities.
   *
   * If {@param should_exist} is `true`, a `404 NOT_FOUND` error will be thrown
   * if the entity or one of the entities doesn't exist.
   *
   * @async
   * @param {OneOrMany<string>} [uid] - Entity id or array of entity ids
   * @param {boolean} [should_exist] - Throw if any entities don't exist
   * @return {Promise<string[]>} Promise containing array of deleted entity ids
   */
  async delete(
    uid?: OneOrMany<E['id']>,
    should_exist?: boolean
  ): Promise<string[]> {
    // Remove entities from in-memory repository
    const entities = await super.delete(uid, should_exist)

    // Remove entities from database repository
    await this.cacheSync()

    return entities as string[]
  }

  /**
   * Partially updates an entity; `created_at` and `id`  cannot be patched.
   *
   * Throws an error if the entity isn't found, or if schema validation is
   * enabled and fails.
   *
   * @async
   * @param {string} uid - ID of resource to update
   * @param {PatchEntityDTO<E>} [dto] - Data to patch entity
   * @param {string[]} [rfields] - Additional readonly fields
   * @return {Promise<E>} Promise containing updated entity
   */
  async patch(
    uid: E['id'],
    dto: PatchEntityDTO<E> = {} as PatchEntityDTO<E>,
    rfields?: string[]
  ): Promise<E> {
    // Get all readonly fields
    rfields = ['created_at', 'updated_at'].concat(rfields || [])

    // Patch entity in in-memory repository and push additional readonly props
    await super.patch(uid, merge({}, dto, { updated_at: Date.now() }), rfields)

    // Patch entity in database repository and return updated entity
    return (await this.cacheSync())[uid as string]
  }

  /**
   * Creates or patches a single entity or array of entities.
   * If any entity already exists, it will be patched; otherwise inserted.
   *
   * @async
   * @param {OneOrMany<EntityDTO<E>>} dto - Entities to upsert
   * @return {Promise<E[]>} Promise containing new or patched entities
   */
  async save(dto: OneOrMany<EntityDTO<E>>): Promise<E[]> {
    // Upsert entities into in-memory repository
    const entities = await super.save(dto)

    // Get entity uids
    const uids = entities.map(e => e.id)

    // Upsert entities in database repository
    return Object.values(pick(await this.cacheSync(), uids))
  }
}
