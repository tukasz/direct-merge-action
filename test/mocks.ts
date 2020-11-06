import * as core from '@actions/core';
import * as github from '@actions/github';

interface MergeResponse {
  status: number;
  data?: {
    sha?: string;
    message?: string;
  };
}

export const octokitMock = {
  repos: {
    merge: jest.fn(() => ({
      status: 201,
      data: {
        sha: '1234',
        message: '',
      },
    } as MergeResponse)),
  },
};

export const loggerMock = {
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};

export const setFailedMock = jest.fn();

export const getInputMock = jest.fn((key) => `__${key}__`);

jest.spyOn(core, 'getInput').mockImplementation(getInputMock);
jest.spyOn(core, 'setFailed').mockImplementation(setFailedMock);
jest.spyOn(core, 'info').mockImplementation(loggerMock.info);
jest.spyOn(core, 'warning').mockImplementation(loggerMock.warning);
jest.spyOn(core, 'error').mockImplementation(loggerMock.error);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.spyOn(github, 'getOctokit').mockImplementation(() => octokitMock as any);
