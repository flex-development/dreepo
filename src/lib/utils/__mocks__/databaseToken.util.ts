/**
 * @file Mock - databaseToken
 * @module lib/utils/mocks/databaseToken
 * @see https://jestjs.io/docs/next/manual-mocks#mocking-user-modules
 */

const mockToken = Promise.resolve('DATABASE_ACCESS_TOKEN')

export default jest.fn().mockReturnValue(mockToken)
