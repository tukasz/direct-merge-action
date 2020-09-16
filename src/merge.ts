import { getInput, info, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { OctokitResponse, ReposMergeResponseData } from '@octokit/types';

async function merge(): Promise<void> {
  const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
  const owner = getInput('owner') || (process.env.GITHUB_REPOSITORY || '').split('/')[0];
  const repo = getInput('repo') || (process.env.GITHUB_REPOSITORY || '').split('/')[1];
  const head = getInput('source-branch');
  const base = getInput('target-branch');
  const octokit = getOctokit(GITHUB_TOKEN);

  if (!owner) {
    return setFailed(`Owner of the repository was not specified and could not be derived from GITHUB_REPOSITORY env variable (${process.env.GITHUB_REPOSITORY})`)
  }

  if (!repo) {
    return setFailed(`Repository name was not specified and could not be derived from GITHUB_REPOSITORY env variable (${process.env.GITHUB_REPOSITORY})`)
  }

  info(
    `Running direct GitHub merge of ${owner}/${repo} ${head} -> ${base}`
  );

  const res: OctokitResponse<ReposMergeResponseData> = await octokit.repos.merge({
    owner,
    repo,
    base,
    head,
    commit_message: `Automatic merge of ${head} -> ${base}`,
  }) as OctokitResponse<ReposMergeResponseData>

  info(`Merged ${head} -> ${base} (${res.data.sha})`);
}

export async function run(): Promise<void> {
  return merge().catch((error: Error): void => {
    setFailed(`An unexpected error occurred: ${error.message}`);
  });
}