/**
 * @file Conventional Changelog Configuration
 * @see https://github.com/conventional-changelog
 */

const sections = {
  docs: ':book: Documentation',
  feat: ':package: Features',
  fix: ':bug: Fixes',
  other: ':page_facing_up: Other Changes',
  perf: ':zap: Performance Updates',
  revert: ':rewind: Revert',
  test: ':robot: Testing',
  wip: ':construction: Work in Progress'
}

module.exports = {
  types: [
    { type: 'feat', section: sections.feat },
    { type: 'fix', section: sections.fix },
    { type: 'perf', section: sections.perf },
    { type: 'revert', section: sections.revert },
    { type: 'test', section: sections.test },
    { type: 'docs', section: sections.docs },
    { type: 'wip', section: sections.wip },
    { type: 'build', hidden: true },
    { type: 'chore', hidden: true },
    { type: 'ci', hidden: true },
    { type: 'refactor', section: true },
    { type: 'style', hidden: true }
  ],
  releaseCommitMessageFormat: 'chore(release): publish v{{currentTag}}'
}
