import type { AxiosRequestConfig as Config } from 'axios'

/**
 * @file Interface - DBRequestConfig
 * @module lib/interfaces/DBRequestConfig
 */

/**
 * Axios request config for the Firebase Database REST API.
 */
export interface DBRequestConfig extends Omit<Config, 'baseURL' | 'params'> {
  params?: Omit<PlainObject, 'access_token'>
}
