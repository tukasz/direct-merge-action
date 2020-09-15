import { getInput, info, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { OctokitResponse, ReposMergeResponseData } from '@octokit/types';

async function merge(): Promise<void> {
  const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
  const GITHUB_LOGIN = getInput('GITHUB_LOGIN');
  const owner = getInput('owner');
  const repo = getInput('repo');
  const head = getInput('source-branch');
  const base = getInput('target-branch');
  const octokit = getOctokit(GITHUB_TOKEN);

  info(
    `Running direct GitHub merge of ${owner}/${repo} ${head} -> ${base} as: ${GITHUB_LOGIN}`
  );

  const res: OctokitResponse<ReposMergeResponseData> = await octokit.repos.merge({
    owner,
    repo,
    base,
    head,
    commit_message: `Automatic merge of ${head} -> ${base}`
  }) as OctokitResponse<ReposMergeResponseData>

  info(`Merged ${head} -> ${base} (${res.data.sha})`);
}

export async function run(): Promise<void> {
  return merge().catch((error: Error): void => {
    setFailed(`An unexpected error occurred: ${error.message}`);
  });
}