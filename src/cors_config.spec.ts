import { acceptedOrigins } from './cors_config';

describe('cors config', () => {
  it('should throw an error via ctx when not accepted', () => {
    const origin = 'https://paca.ime.usp.br';
    const ctx = {
      get: () => origin,
      throw: jest.fn()
    };

    acceptedOrigins(ctx);

    expect(ctx.throw).toHaveBeenCalled();
  });

  it('should return the given origin when accepted', () => {
    const origin = 'http://localhost:3000/results';
    const ctx = {
      get: () => origin,
      throw: jest.fn()
    };

    const ret = acceptedOrigins(ctx);
    expect(ctx.throw).not.toHaveBeenCalled();
    expect(ret).toEqual(origin);
  });
});
