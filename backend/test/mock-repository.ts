import { ObjectLiteral, Repository } from 'typeorm';

export type MockRepo<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

export const createMockRepo = <T extends ObjectLiteral = any>(): MockRepo<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});
