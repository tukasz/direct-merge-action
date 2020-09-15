[![codecov](https://codecov.io/gh/tukasz/direct-merge-action/branch/master/graph/badge.svg)](https://codecov.io/gh/tukasz/direct-merge-action)

# direct-merge-action

A GitHub action which directly merges one branch into another (without a PR) in given repository.

## Usage


Action expects 4 arguments:
* `GITHUB_TOKEN` - standard token taken from: `secrets.GITHUB_TOKEN`
* `owner` - owner of the repository
* `repo` - name of the repository
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