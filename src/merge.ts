import { getInput, info, warning, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import {
  OctokitResponse,
  ReposMergeResponseData,
  ReposMergeResponse404Data,
  ReposMergeResponse409Data,
} from '@octokit/types';

async function merge(): Promise<void> {
  const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
  const owner = getInput('owner') || (process.env.GITHUB_REPOSITORY || '').split('/')[0];
  const repo = getInput('repo') || (process.env.GITHUB_REPOSITORY || '').split('/')[1];
  const head = getInput('source-branch');
  const base = getInput('target-branch');
  const commitMessage = getInput('commit-message') || `Automatic merge of ${head} -> ${base}`;

  if (!GITHUB_TOKEN) {
    return setFailed('GITHUB_TOKEN was not specified');
  }

  if (!owner) {
    return setFailed(
      `Owner of the repository was not specified and could not be derived from GITHUB_REPOSITORY env variable (${process.env.GITHUB_REPOSITORY})`
    );
  }

  if (!repo) {
    return setFailed(
      `Repository name was not specified and could not be derived from GITHUB_REPOSITORY env variable (${process.env.GITHUB_REPOSITORY})`
    );
  }

  const octokit = getOctokit(GITHUB_TOKEN);

  info(`Running direct GitHub merge of ${owner}/${repo} ${head} -> ${base}`);

  const res: OctokitResponse<ReposMergeResponseData | ReposMergeResponse404Data | ReposMergeResponse409Data> = (await octokit.repos.merge({
    owner,
    repo,
    base,
    head,
    commit_message: commitMessage,
  })) as OctokitResponse<ReposMergeResponseData | ReposMergeResponse404Data | ReposMergeResponse409Data>;

  if (res) {
    switch (res.status) {
      case 201:
        info(`Merged ${head} -> ${base} (${(res as OctokitResponse<ReposMergeResponseData>).data?.sha})`);

        break;

      case 204:
        info('Target branch already contains changes from source branch. Nothing to merge');

        break;

      case 409:
        setFailed(`Merge conflict. ${(res as OctokitResponse<ReposMergeResponse409Data>).data?.message}`);

        break;

      case 404:
        setFailed(`Branch not found. ${(res as OctokitResponse<ReposMergeResponse404Data>).data?.message}`);

        break;

      default:
        warning(`Merge action has completed, but with an unknown status code: ${res.status}`);
    }
  } else {
    return setFailed('An unknown error occurred during merge operation (empty response)');
  }
}

export async function run(): Promise<void> {
  return merge().catch((error: Error): void => {
    setFailed(`An unexpected error occurred: ${error.message}`);
  });
}
