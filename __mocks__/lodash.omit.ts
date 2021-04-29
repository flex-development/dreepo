/**
 * @file Mock - lodash.omit
 * @module mocks/lodash.omit
 * @see https://jestjs.io/docs/next/manual-mocks#mocking-node-modules
 * @see https://github.com/lodash/lodash
 */

export default jest.fn((...args) => jest.requireActual('lodash.omit')(...args))
