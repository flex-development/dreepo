#!/bin/zsh

# Pre Publish Only Workflow

# 1. Disable `postinstall` script
# 2. Compile project
pinst -d
yarn compile
