import type { ObjectPlain } from '@flex-development/tutils'
import type { AxiosRequestConfig } from 'axios'

/**
 * @file Interface - DBRequestConfig
 * @module interfaces/DBRequestConfig
 */

/**
 * Axios request config for the Firebase Database REST API.
 *
 * @extends AxiosRequestConfig
 */
export interface DBRequestConfig
  extends Omit<AxiosRequestConfig, 'baseURL' | 'params'> {
  params?: Omit<ObjectPlain, 'access_token'>
}
