import debug from 'debug'
import pkg from '../../package.json'

/**
 * @file Config - Logger
 * @module config/logger
 * @see https://github.com/visionmedia/debug
 */

export default debug(pkg.name.split('/')[1])
