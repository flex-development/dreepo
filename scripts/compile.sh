#!/bin/zsh

# Package Compilation Workflow
# See: https://github.com/cevek/ttypescript

# 1. Remove existing `dist` directory
# 2. Compile package with ttypescript
# 3. Fix node module import paths
rm -rf dist || true
ttsc -p tsconfig.prod.json
node scripts/js/fix-node-module-paths
