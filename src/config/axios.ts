import onFulfilled from '@/lib/utils/onFulfilled.util'
import onRejected from '@/lib/utils/onRejected.util'
import axios from 'axios'

/**
 * @file Config - Axios
 * @module config/axios
 * @see https://github.com/axios/axios
 */

/** @see https://github.com/axios/axios#interceptors */
export const interceptors = axios.interceptors.response.use(
  onFulfilled,
  onRejected
)

export default axios
