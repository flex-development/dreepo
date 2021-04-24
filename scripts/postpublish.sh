#!/bin/zsh

# Post Publish Workflow

# 1. Re-enable postinstall script
# 2. Checkout `next` branch
# 3. Rebase origin/main (with new, recently published code) onto `next`
# 4. Push updates
pinst -e
git ch next
git rebase origin/main
git pnv
