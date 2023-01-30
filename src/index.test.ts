import { lint } from '.';

describe('lint()', () => {
  it('lint', async () => {
    expect(await lint({})).toBeUndefined();
  });
  it('fix', async () => {
    expect(await lint({ fix: true })).toBeUndefined();
  });
});
