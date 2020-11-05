![GitHub package.json version](https://img.shields.io/github/package-json/v/tukasz/direct-merge-action)
[![codecov](https://codecov.io/gh/tukasz/direct-merge-action/branch/master/graph/badge.svg)](https://codecov.io/gh/tukasz/direct-merge-action)
![GitHub](https://img.shields.io/github/license/tukasz/direct-merge-action)

# direct-merge-action

A GitHub action which directly merges one branch into another (without a PR) in given repository.

## Usage


Action expects up to 5 arguments:
* `GITHUB_TOKEN` - standard token taken from: `secrets.GITHUB_TOKEN`
* `owner` - owner of the repository (optional, uses owner of current repository as default)
* `repo` - name of the repository (optional, uses current repository as default)
* `source-branch` - branch to merge from
* `target-branch` - branch to merge to

### Example:

```yaml
# .github/workflows/main.yml

name: Main workflow

on:
  push:
    branches: [master]

jobs:
  merge-master-to-develop:
    name: Merge master -> develop
    runs-on: ubuntu-latest

    steps:
        uses: tukasz/direct-merge-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          owner: tukasz
          repo: direct-merge-action
          source-branch: master
          target-branch: develop

```
