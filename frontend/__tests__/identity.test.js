/**
 * Identity resolution — the local display name must always come from the
 * real authenticated/profile state, and must never fall back to another
 * person's hardcoded name (regression test for the "Aarav" bug).
 */
import { resolveDisplayName } from '../src/utils/identity';

test('uses the authenticated user display name when no profile name is set', () => {
  const name = resolveDisplayName({ profile: null, authUser: { displayName: 'Nilanjana' } });
  expect(name).toBe('Nilanjana');
});

test('prefers the profile-setup name over the auth account name when both exist', () => {
  const name = resolveDisplayName({
    profile: { fullName: 'Panchali' },
    authUser: { displayName: 'Nilanjana' },
  });
  expect(name).toBe('Panchali');
});

test('falls back to the auth name when the profile name is blank', () => {
  const name = resolveDisplayName({ profile: { fullName: '   ' }, authUser: { displayName: 'Nilanjana' } });
  expect(name).toBe('Nilanjana');
});

test('falls back to a neutral placeholder when no name is available anywhere', () => {
  const name = resolveDisplayName({ profile: null, authUser: null });
  expect(name).toBe('ShadowNet user');
});

test('never returns a hardcoded placeholder person\'s name', () => {
  const cases = [
    resolveDisplayName(),
    resolveDisplayName({ profile: {}, authUser: {} }),
    resolveDisplayName({ profile: { fullName: '' }, authUser: { displayName: '' } }),
  ];
  cases.forEach((name) => {
    expect(name).not.toBe('Aarav');
  });
});
