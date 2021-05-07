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

  // Generate initial release notes content
  execa.commandSync(`standard-version --dry-run >>${RELEASE_NOTES}`, sync)

  // Read notes file and get what would be new CHANGELOG content
  let notes = readFileSync(RELEASE_NOTES_PATH, 'utf8').split('---')[1]

  // Get index of first heading
  const first_heading_index = notes.indexOf('### :')

  // Check if index is equal to -1 (no headings)
  if (first_heading_index === -1) {
    debug(`${RELEASE_NOTES} does not contain any headings.`)
    debug('Assumed to have no body content.')

    return null
  }

  // Trim notes
  notes = notes.substring(first_heading_index, notes.length)

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
