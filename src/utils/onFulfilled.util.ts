import type { AxiosResponse } from 'axios'

/**
 * @file Implementation - onFulfilled
 * @module utils/onFulfilled
 */

/**
 * Returns the data from a successful request.
 *
 * @template T - Shape of data
 *
 * @param {AxiosResponse<T>} response - Response object
 * @param {T} response.data - Response data
 * @return {T} Response data
 */
function onFulfilled<T = any>(response: AxiosResponse<T>): T {
  return response.data
}

export default onFulfilled
