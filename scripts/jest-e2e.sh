#!/bin/zsh

# Custom Jest E2E Test Workflow Script

# 1.Set `BABEL_ENV` environment variable
# 2. Clear cache
# 3. Run Jest with e2e config + global flags and allow for additional arguments
BABEL_ENV=jest
jest --clearCache
jest --config=jest.config.e2e.ts --passWithNoTests $@
