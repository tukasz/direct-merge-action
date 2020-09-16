import {
  getInputMock,
  loggerMock,
  octokitMock,
  setFailedMock,
} from '../test/mocks';
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
      commit_message: `Automatic merge of __source-branch__ -> __target-branch__`,
    });
  });

  it('should log an info after successful merge', async () => {
    await run();

    expect(loggerMock.info).toHaveBeenCalledWith(
      'Merged __source-branch__ -> __target-branch__ (1234)'
    );
  });

  it('should fail the action in case of an error during merge', async () => {
    octokitMock.repos.merge.mockRejectedValueOnce(
      new Error('Something went wrong') as jest.RejectedValue<unknown>
    );

    await run();

    expect(setFailedMock).toHaveBeenCalledWith(
      'An unexpected error occurred: Something went wrong'
    );
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
      commit_message: `Automatic merge of __source-branch__ -> __target-branch__`,
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
      commit_message: `Automatic merge of __source-branch__ -> __target-branch__`,
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

    process.env.GITHUB_REPOSITORY = 'xyz';

    run();

    expect(setFailedMock).toHaveBeenCalledWith(
      'Repository name was not specified and could not be derived from GITHUB_REPOSITORY env variable (xyz)'
    );

    expect(octokitMock.repos.merge).not.toHaveBeenCalled();
  });
});
