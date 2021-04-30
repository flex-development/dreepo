import type { AxiosRequestConfig as Config } from 'axios'
import type { RawObject } from 'mingo/util'

/**
 * @file Interface - DBRequestConfig
 * @module lib/interfaces/DBRequestConfig
 */

/**
 * Axios request config for the Firebase Database REST API.
 */
export interface DBRequestConfig extends Omit<Config, 'baseURL' | 'params'> {
  params?: Omit<RawObject, 'access_token'>
}
