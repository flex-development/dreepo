import type { IEntity } from '@/lib/interfaces'
import type { EmptyObject } from '@/lib/types-global'
import type { RepoRoot } from '@/lib/types-repository'
import databaseRequest from '@/lib/utils/databaseRequest.util'

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
  await databaseRequest<EmptyObject>(path, { data: {}, method: 'put' })
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
  await databaseRequest<RepoRoot<E>>(path, { data, method: 'put' })
  return
}
