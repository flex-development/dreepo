const debug = require('debug')('scripts').extend('js/release-github')
const execa = require('execa')
const { existsSync, readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')
const { name, version } = require('../../package.json')

/**
 * @file GitHub Release Workflow
 * @module scripts/js/release-github
 * @see https://github.com/conventional-changelog/standard-version/issues/610
 */

/**
 * @property {string} CHANGELOG - Name of GitHub CHANGELOG file
 */
const CHANGELOG = 'CHANGELOG.md'

/**
 * @property {string} RELEASE_NOTES - Name of GitHub release notes file
 */
const RELEASE_NOTES = 'RELEASE_NOTES.md'

/**
 * @property {string} RELEASE_NOTES_PATH Path to GitHub release notes
 */
const RELEASE_NOTES_PATH = resolve(__dirname, '..', '..', RELEASE_NOTES)

/**
 * @property {string} TAG - GitHub release tag
 */
const RELEASE_TAG = `v${version}`

/**
 * @property {string} TARBALL - Name of `.tgz` package file
 */
const TARBALL = `${name.split('@')[1].replace('/', '-')}-${RELEASE_TAG}.tgz`

/**
 * @property {string} ZIP - Name of `.zip` package file
 */
const ZIP = `${TARBALL.replace('.tgz', '.zip')}`

/**
 * @property {execa.SyncOptions<string>} sync - `execa.commandSync` options
 */
const sync = { shell: 'zsh', stdout: process.stdout }

/**
 * Creates or deletes a release tarball and zip file.
 *
 * @param {boolean} remove - If `true`, remove release assets
 * @return {void} Nothing when complete
 */
const releaseAssets = (remove = false) => {
  const ASSETS = [TARBALL, ZIP]

  if (!remove) {
    execa.commandSync(`yarn pack --filename ${TARBALL}`, sync)
    execa.commandSync(`yarn pack --filename ${ZIP}`, sync)
  } else {
    execa.commandSync(`rm ${TARBALL} ${ZIP}`, sync)
    ASSETS.forEach(arg => debug(`Removed ${arg}`))
  }

  return
}

/**
 * Deletes or formats the GitHub release notes file.
 *
 * The function will return the GitHub release notes content or `null` if the
 * file content does not contain the pattern `### :` anywhere. This pattern
 * indicates a level three heading that starts with an emoji.
 *
 * If the notes have been successfully formatted, the original GitHub release
 * notes file will be updated to contain the formatted content.
 *
 * @param {boolean} remove - If `true`, remove release notes file
 * @return {string | null} Formatted release notes or null
 */
const releaseNotes = (remove = false) => {
  // Remove existing release notes file if it exists
  if (existsSync(RELEASE_NOTES_PATH)) {
    execa.commandSync(`rm ${RELEASE_NOTES}`, sync)
    if (remove) return null
  }

  // Read CHANGELOG
  let notes = readFileSync(CHANGELOG, 'utf8')

  // Get index of recent changes
  let first_heading_index = notes.indexOf(`## [${version}]`)

  // Check for minor / patch headings
  first_heading_index = notes.indexOf(`### [${version}]`)

  // Check if index is equal to -1 (no recent changes)
  if (first_heading_index === -1) {
    debug(`${RELEASE_NOTES} does not contain any recent changes.`)
    return null
  }

  // Get index of first heading with emoji
  first_heading_index = notes.indexOf('### :')

  // Check for BREAKING CHANGES header
  if (first_heading_index === -1) first_heading_index = notes.indexOf('### ⚠')

  // Check if index is equal to -1 (no headings)
  if (first_heading_index === -1) {
    debug(`${RELEASE_NOTES} ${version} does not contain any headings.`)
    debug('Assumed to contain no recent changes.')

    return null
  }

  // Trim notes
  notes = notes.substring(first_heading_index, notes.length)

  // Get last heading index
  let last_heading_index = notes.indexOf('## [')

  // Check for minor / patch headings
  if (last_heading_index === -1) last_heading_index = notes.indexOf('### [')

  if (last_heading_index === -1) {
    debug(`${RELEASE_NOTES} ${version} changes do not terminate.`)
    debug('Cannot find heading associated with previous version.')

    return null
  }

  // Trim notes
  notes = notes.substring(0, last_heading_index)

  // Change heading sizes
  notes = notes.replaceAll('###', '##')

  // Update release notes file
  writeFileSync(RELEASE_NOTES_PATH, notes)
  debug(`Finished formatting ${RELEASE_NOTES}`)

  return notes
}

/**
 * Creates a GitHub release.
 *
 * @return {void} Nothing when complete
 */
const githubRelease = () => {
  // Workflow constants
  const CLEANUP = true
  const GENERATE = false
  const PACKAGE = `${name}@${version}`
  const RELEASE = `gh release create ${RELEASE_TAG} ./${TARBALL} ./${ZIP}`
  const RELEASE_OPTIONS = `-t ${RELEASE_TAG} -d -F ${RELEASE_NOTES}`

  // Generate release assets and notes
  debug(`Starting release workflow for ${PACKAGE}`)
  releaseAssets(GENERATE)
  releaseNotes(GENERATE)

  // Execute GitHub release
  execa.commandSync(`${RELEASE} ${RELEASE_OPTIONS}`, sync)

  // Cleanup after workflow completion
  debug('Cleaning up release workflow...')
  releaseAssets(CLEANUP)
  releaseNotes(CLEANUP)

  return
}

githubRelease()
