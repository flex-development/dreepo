#!/bin/zsh

# Custom Jest E2E Test Workflow Script

# 1. Compile package
# 1. Set `BABEL_ENV` environment variable
# 2. Run Jest with e2e config + global flags and allow for additional arguments
zsh scripts/compile.sh
BABEL_ENV=jest
jest --config=jest.config.e2e.ts --detectOpenHandles --passWithNoTests $@
