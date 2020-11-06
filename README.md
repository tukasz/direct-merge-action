![GitHub package.json version](https://img.shields.io/github/package-json/v/tukasz/direct-merge-action)
[![codecov](https://codecov.io/gh/tukasz/direct-merge-action/branch/master/graph/badge.svg)](https://codecov.io/gh/tukasz/direct-merge-action)
![GitHub](https://img.shields.io/github/license/tukasz/direct-merge-action)

# direct-merge-action

A GitHub action which directly merges one branch into another (without a PR) in given repository.

## Usage


Action expects up to 6 parameters:
* `GITHUB_TOKEN` - standard token taken from: `secrets.GITHUB_TOKEN` - required
* `source-branch` - branch to merge from - required
* `target-branch` - branch to merge to - required
* `owner` - owner of the repository - optional, uses owner of current repository as default
* `repo` - name of the repository - optional, uses current repository as default
* `commit-message` - message to use for the commit - optional, uses "Automatic merge of \<source-branch\> -> \<target-branch\>" as default

### Example 1 (all parameters):

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
        uses: tukasz/direct-merge-action@master
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          owner: tukasz
          repo: direct-merge-action
          source-branch: master
          target-branch: develop
          commit-message: "Lorem ipsum..."

```

### Example 2 (required parameters only):

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
        uses: tukasz/direct-merge-action@master
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          source-branch: master
          target-branch: develop

```
