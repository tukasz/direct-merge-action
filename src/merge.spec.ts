import { loggerMock, octokitMock, setFailedMock } from '../test/mocks';
import { run } from './merge';

describe('run', () => {
  it('should log an info with parameter details', () => {
    run();

    expect(loggerMock.info).toHaveBeenCalledWith('Running direct GitHub merge of __owner__/__repo__ __source-branch__ -> __target-branch__');
  });

  it('should send a merge request', () => {
    run();

    expect(octokitMock.repos.merge).toHaveBeenCalledWith({
      owner: '__owner__',
      repo: '__repo__',
      base: '__target-branch__',
      head: '__source-branch__',
      commit_message: `Automatic merge of __source-branch__ -> __target-branch__`
    });
  });

  it('should log an info after successful merge', async () => {
    await run()

    expect(loggerMock.info).toHaveBeenCalledWith('Merged __source-branch__ -> __target-branch__ (1234)');
  });

  it('should fail the action in case of an error during merge', async () => {
    octokitMock.repos.merge.mockRejectedValueOnce(new Error('Something went wrong') as jest.RejectedValue<unknown>)

    await run()

    expect(setFailedMock).toHaveBeenCalledWith('An unexpected error occurred: Something went wrong');
  });
});
