import { getInput, info, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
const GITHUB_LOGIN = getInput('GITHUB_LOGIN');
const owner = getInput('owner');
const repo = getInput('repo');
const sourceBranch = getInput('source-branch');
const targetBranch = getInput('target-branch');
const octokit = getOctokit(GITHUB_TOKEN);

const main = async (): Promise<void> => {
  info(
    `Running direct GitHub merge of ${owner}/${repo} ${sourceBranch} -> ${targetBranch} as: ${GITHUB_LOGIN}`
  );

  const branches = await octokit.repos.listBranches({
    owner,
    repo,
  });

  info(`Branches: ${JSON.stringify(branches, null, 2)}`);
};

main().catch((error: Error): void => {
  setFailed(`An unexpected error occurred: ${error.message}`);
});
