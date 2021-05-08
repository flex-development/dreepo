import type { IEntity } from '@/lib/interfaces/entity.interface'
import type { EmptyObject } from '@/lib/types-global'
import type { RepoRoot } from '@/lib/types-repository'
import DBConnection from './__fixtures__/db-connection.fixture'

/**
 * @file Test Utilities
 * @module tests/utils
 */

/**
 * Clears a database repository.
 *
 * @async
 * @param {string} path - Repository database path
 * @return {Promise<void>} Empty promise when complete
 */
export const clearRepository = async (path: string): Promise<void> => {
  await DBConnection.request<EmptyObject>(path, { data: {}, method: 'put' })
  return
}

/**
 * Loads data into a repository.
 *
 * @template E - Entity
 *
 * @async
 * @param {string} path - Repository database path
 * @param {RepoRoot<E>} data - Repository root data
 * @return {Promise<void>} Empty promise when complete
 */
export async function loadRepository<E extends IEntity = IEntity>(
  path: string,
  data: RepoRoot<E>
): Promise<void> {
  await DBConnection.request<RepoRoot<E>>(path, { data, method: 'put' })
  return
}
