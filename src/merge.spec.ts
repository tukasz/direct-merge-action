import { getInputMock, loggerMock, octokitMock, setFailedMock } from '../test/mocks';
import { run } from './merge';

describe('run', () => {
  it('should log an info with parameter details', () => {
    run();

    expect(loggerMock.info).toHaveBeenCalledWith(
      'Running direct GitHub merge of __owner__/__repo__ __source-branch__ -> __target-branch__'
    );
  });

  it('should send a merge request', () => {
    run();

    expect(octokitMock.repos.merge).toHaveBeenCalledWith({
      owner: '__owner__',
      repo: '__repo__',
      base: '__target-branch__',
      head: '__source-branch__',
      commit_message: `__commit-message__`,
    });
  });

  it('should log an info after successful merge', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 201,
      data: {
        sha: '1234',
      },
    });

    await run();

    expect(loggerMock.info).toHaveBeenCalledWith('Merged __source-branch__ -> __target-branch__ (1234)');
  });

  it('should work for 201 status in case of empty/nullish data', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 201,
    });

    await run();

    expect(loggerMock.info).toHaveBeenCalledWith('Merged __source-branch__ -> __target-branch__ ()');
  });

  it('should log an info if there is nothing to merge', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 204,
    });

    await run();

    expect(loggerMock.info).toHaveBeenCalledWith(
      'Target branch already contains changes from source branch. Nothing to merge'
    );
  });

  it('should fail in case of merge conflict', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 409,
      data: {
        message: 'A message XYZ',
      },
    });

    await run();

    expect(setFailedMock).toHaveBeenCalledWith('Merge conflict. A message XYZ');
  });

  it('should work for 409 status in case of empty/nullish data', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 409,
    });

    await run();

    expect(setFailedMock).toHaveBeenCalledWith('Merge conflict. ');
  });

  it('should fail if non-existing branch was specified', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 404,
      data: {
        message: 'A message ABC',
      },
    });

    await run();

    expect(setFailedMock).toHaveBeenCalledWith('Branch not found. A message ABC');
  });

  it('should work for 404 status in case of empty/nullish data', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 404,
    });

    await run();

    expect(setFailedMock).toHaveBeenCalledWith('Branch not found. ');
  });

  it('should fail the action in case of an error during merge', async () => {
    octokitMock.repos.merge.mockRejectedValueOnce(new Error('Something went wrong') as jest.RejectedValue<unknown>);

    await run();

    expect(setFailedMock).toHaveBeenCalledWith('An unexpected error occurred: Something went wrong');
  });

  it('should log a warning if merge was completed with an unknown status code', async () => {
    octokitMock.repos.merge.mockReturnValueOnce({
      status: 123,
    });

    await run();

    expect(loggerMock.warning).toHaveBeenCalledWith('Merge action has completed, but with an unknown status code: 123');
  });

  it('should fail the action if merge result is empty', async () => {
    octokitMock.repos.merge.mockReturnValueOnce(null);

    await run();

    expect(setFailedMock).toHaveBeenCalledWith('An unknown error occurred during merge operation (empty response)');
  });

  it('should use owner from environment if it is not specified in action input', () => {
    getInputMock.mockImplementation((key) => {
      if (key === 'owner') {
        return null;
      }

      return `__${key}__`;
    });

    process.env.GITHUB_REPOSITORY = 'anowner/somerepo';

    run();

    expect(octokitMock.repos.merge).toHaveBeenCalledWith({
      owner: 'anowner',
      repo: '__repo__',
      base: '__target-branch__',
      head: '__source-branch__',
      commit_message: `__commit-message__`,
    });
  });

  it('should use repository name from environment if it is not specified in action input', () => {
    getInputMock.mockImplementation((key) => {
      if (key === 'repo') {
        return null;
      }

      return `__${key}__`;
    });

    process.env.GITHUB_REPOSITORY = 'anowner/somerepo';

    run();

    expect(octokitMock.repos.merge).toHaveBeenCalledWith({
      owner: '__owner__',
      repo: 'somerepo',
      base: '__target-branch__',
      head: '__source-branch__',
      commit_message: `__commit-message__`,
    });
  });

  it('should use both owner and repository name from environment if they are not specified in action input', () => {
    getInputMock.mockImplementation((key) => {
      if (key === 'owner' || key === 'repo') {
        return null;
      }

      return `__${key}__`;
    });

    process.env.GITHUB_REPOSITORY = 'anowner/somerepo';

    run();

    expect(octokitMock.repos.merge).toHaveBeenCalledWith({
      owner: 'anowner',
      repo: 'somerepo',
      base: '__target-branch__',
      head: '__source-branch__',
      commit_message: `__commit-message__`,
    });
  });

  it('should use default commit message if one is not specified in the input', () => {
    getInputMock.mockImplementation((key) => {
      if (key === 'commit-message') {
        return null;
      }

      return `__${key}__`;
    });

    run();

    expect(octokitMock.repos.merge).toHaveBeenCalledWith({
      owner: '__owner__',
      repo: '__repo__',
      base: '__target-branch__',
      head: '__source-branch__',
      commit_message: `Automatic merge of __source-branch__ -> __target-branch__`,
    });
  });

  it('should fail if owner was not specified and cannot be derived from GITHUB_REPOSITORY env variable', () => {
    getInputMock.mockImplementation((key) => {
      if (key === 'owner') {
        return null;
      }

      return `__${key}__`;
    });

    process.env.GITHUB_REPOSITORY = '';

    run();

    expect(setFailedMock).toHaveBeenCalledWith(
      'Owner of the repository was not specified and could not be derived from GITHUB_REPOSITORY env variable ()'
    );

    expect(octokitMock.repos.merge).not.toHaveBeenCalled();
  });

  it('should fail if repository was not specified and cannot be derived from GITHUB_REPOSITORY env variable', () => {
    getInputMock.mockImplementation((key) => {
      if (key === 'repo') {
        return null;
      }

      return `__${key}__`;
    });

    process.env.GITHUB_REPOSITORY = '';

    run();

    expect(setFailedMock).toHaveBeenCalledWith(
      'Repository name was not specified and could not be derived from GITHUB_REPOSITORY env variable ()'
    );

    expect(octokitMock.repos.merge).not.toHaveBeenCalled();
  });

  it('should fail if GITHUB_TOKEN was not specified', () => {
    getInputMock.mockImplementation((key) => {
      if (key === 'GITHUB_TOKEN') {
        return null;
      }

      return `__${key}__`;
    });

    run();

    expect(setFailedMock).toHaveBeenCalledWith('GITHUB_TOKEN was not specified');

    expect(octokitMock.repos.merge).not.toHaveBeenCalled();
  });
});
