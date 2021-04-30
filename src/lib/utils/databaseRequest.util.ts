import axios from '@/config/axios'
import configuration from '@/config/configuration'
import type { DBRequestConfig } from '@/lib/interfaces'
import type { RepoHttpClient } from '@/lib/types'
import databaseToken from '@/lib/utils/databaseToken.util'
import type { AxiosRequestConfig } from 'axios'
import isPlainObject from 'lodash.isplainobject'

/**
 * @file Implementation - databaseRequest
 * @module lib/utils/databaseRequest
 */

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
 * @param {string} path - Database repository path
 * @param {DBRequestConfig} [config] - Axios request config
 * @param {RepoHttpClient} [http] - HTTP client
 * @return {Promise<T>} Promise containing response payload
 * @throws {Exception}
 */
async function databaseRequest<T = any>(
  path: string,
  config: DBRequestConfig = {},
  http: RepoHttpClient = axios
): Promise<T> {
  const $config: AxiosRequestConfig = {
    ...config,
    baseURL: `${configuration().FIREBASE_DATABASE_URL}/${path}`,
    params: {
      ...(isPlainObject(config.params) ? config.params : {}),
      access_token: await databaseToken(),
      print: 'pretty'
    },
    url: `/${(config.url || '').trim()}.json`
  }

  // Make request
  const response = await http($config)

  // ! If repository root is empty, null will be returned
  if ($config?.url === '/.json') return (response || {}) as T

  // Return response
  return response as T
}

export default databaseRequest
