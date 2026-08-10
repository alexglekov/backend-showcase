import { randomUUID } from 'crypto';

export const createTestUserFactory = () => {
  return {
    id: randomUUID(),
    name: 'Test',
    email: 'test@test.com',
    isInfluencer: false,
  };
};

export const createTestUpDownGameFactory = () => {
  return {
    id: randomUUID(),
  };
};

export const createTestUpDownBetFactory = () => {
  return {
    id: randomUUID(),
  };
};
