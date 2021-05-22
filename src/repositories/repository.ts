import logger from '@/config/logger'
import type { EntityDTO, RepoOptionsDTO } from '@/dto'
import type {
  IEntity,
  IRepoDBConnection,
  IRepository,
  IRepoValidator,
  RepoCache,
  RepoOptions,
  RepoValidatorOptions
} from '@/interfaces'
import { RepoValidator } from '@/mixins'
import type {
  EntityClass,
  EUID,
  RepoParsedUrlQuery,
  RepoRoot,
  RepoSearchParams
} from '@/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import { Mango } from '@flex-development/mango'
import type {
  MangoParserOptions,
  MingoOptions
} from '@flex-development/mango/interfaces'
import type { OneOrMany, OrPartial } from '@flex-development/tutils'
import type { Debugger } from 'debug'
import isEmpty from 'lodash.isempty'
import merge from 'lodash.merge'
import omit from 'lodash.omit'
import uniq from 'lodash.uniq'
import { v4 as uuid } from 'uuid'

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
 * @template Q - Parsed URL query object
 *
 * @class Repository
 * @implements {IRepository<E, P, Q>}
 */
export default class Repository<
    E extends IEntity = IEntity,
    P extends RepoSearchParams<E> = RepoSearchParams<E>,
    Q extends RepoParsedUrlQuery<E> = RepoParsedUrlQuery<E>
  >
  extends Mango<E, EUID, P, Q>
  implements IRepository<E, P, Q> {
  /**
   * @readonly
   * @instance
   * @property {RepoCache} cache - Repository data cache
   */
  readonly cache: RepoCache<E>

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
  readonly logger: Debugger = logger.extend('Repository')

  /**
   * @readonly
   * @instance
   * @property {EntityClass<E>} model - Entity model
   */
  readonly model: EntityClass<E>

  /**
   * @readonly
   * @instance
   * @property {RepoOptions<E>} options - Repository options
   */
  readonly options: RepoOptions<E>

  /**
   * @readonly
   * @instance
   * @property {IRepoValidator<E>} validator - Repository Validation API client
   */
  readonly validator: IRepoValidator<E>

  /**
   * Instantiates a new Realtime Database repository.
   *
   * See:
   *
   * - https://github.com/flex-development/mango
   * - https://github.com/pleerock/class-validator
   * - https://github.com/typestack/class-transformer
   * - https://github.com/MichalLytek/class-transformer-validator
   *
   * @param {IRepoDBConnection} dbconn - Database connection provider
   * @param {EntityClass<E>} model - Entity model
   * @param {RepoOptionsDTO<E>} [options] - Repository options
   * @param {MingoOptions<E, EUID>} [options.mingo] - Global mingo options
   * @param {MangoParserOptions} [options.parser] - MangoParser options
   * @param {RepoValidatorOptions} [options.validation] - Validation API options
   */
  constructor(
    dbconn: IRepoDBConnection,
    model: EntityClass<E>,
    options: RepoOptionsDTO<E> = {}
  ) {
    super(options)

    this.cache = Object.freeze(merge(this.cache, { root: {} }))
    this.dbconn = dbconn
    this.model = model
    this.validator = new RepoValidator(this.model, options.validation)

    this.options = merge(this.options, {
      mingo: { idKey: 'id' as EUID },
      validation: this.validator.tvo
    })
  }

  /**
   * Clears all data from the repository.
   *
   * @async
   * @return {Promise<true>} Promise containing `true`
   * @throws {Exception}
   */
  async clear(): Promise<true> {
    try {
      // ! Update cache
      Object.assign(this.cache, { collection: [], root: {} })

      // ! Clear database
      await this.dbconn.send<RepoRoot<E>>({
        data: this.cache.root,
        method: 'put'
      })
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
   * Throws a `400 BAD_REQUEST` error if schema validation is enabled and fails.
   * Throws a `409 CONFLICT` error if an entity with the same `id` exists.
   *
   * References:
   *
   * - https://firebase.google.com/docs/reference/rest/database#section-put
   * - https://github.com/uuidjs/uuid
   *
   * @async
   * @param {EntityDTO<E>} dto - Data to create new entity
   * @return {Promise<E>} Promise containing new entity
   * @throws {Exception}
   */
  async create(dto: EntityDTO<E>): Promise<E> {
    try {
      let data = merge(Object.assign({}, dto), {
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
      data = await this.validator.check<E>(data)

      // Create new entity
      data = await this.dbconn.send<E>({ data, method: 'put', url: data.id })

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
   * If {@param should_exist} is `true`, a `404 NOT_FOUND` error will be thrown
   * if the entity or one of the entities doesn't exist.
   *
   * @async
   * @param {OneOrMany<string>} id - Entity ID or array of IDs
   * @param {boolean} [should_exist] - Throw if any entities don't exist
   * @return {Promise<string[]>} Promise containing array of deleted entity IDs
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
      await this.dbconn.send<RepoRoot<E>>({
        data: this.cache.root,
        method: 'put'
      })

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
      data = await this.validator.check<E>(data)

      // Update entity
      data = await this.dbconn.send<E>({ data, method: 'put', url: data.id })

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
      const root = await this.dbconn.send<RepoRoot<E>>()

      // Get entities and update mango plugin cache
      const collection: E[] = Object.values(root)

      // @ts-expect-error updating caches (mango plugin and repository)
      this.cache = Object.freeze(merge(this.resetCache(collection), { root }))

      return this.cache
    } catch (error) {
      if (error.constructor.name === 'Exception') throw error

      const code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      const { message, stack } = error

      throw new Exception(code, message, {}, stack)
    }
  }

  /**
   * Creates or updates a single entity or array of entities.
   *
   * If the entity already exists in the database, it will be updated.
   * If the entity does not exist in the database, it will be inserted.
   *
   * @async
   * @param {OneOrMany<OrPartial<EntityDTO<E>>>} dto - Entities to upsert
   * @return {Promise<E[]>} Promise containing new or updated entities
   */
  async save(dto: OneOrMany<OrPartial<EntityDTO<E>>>): Promise<E[]> {
    /**
     * Creates or updates a single entity.
     *
     * If the entity already exists in the database, it will be updated.
     * If the entity does not exist in the database, it will be inserted.
     *
     * @async
     * @param {OrPartial<EntityDTO<E>>} dto - Data to upsert entity
     * @return {Promise<E>} Promise containing new or updated entiy
     */
    const upsert = async (dto: OrPartial<EntityDTO<E>>): Promise<E> => {
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
}
