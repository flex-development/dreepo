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
  await databaseRequest(path, { data: {}, method: 'put' })
  return
}
