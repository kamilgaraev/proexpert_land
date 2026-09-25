import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearProjectInvitationReturnPath,
  getProjectParticipantInvitationPath,
  getSafeProjectInvitationReturnPath,
  readProjectInvitationReturnPath,
  storeProjectInvitationReturnPath,
} from './projectParticipantInvitationReturn';

describe('project participant invitation return path', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('builds an encoded internal route from a token', () => {
    expect(getProjectParticipantInvitationPath('token/part')).toBe('/project-invitations/token%2Fpart');
  });

  it.each([
    'https://attacker.test/project-invitations/token',
    '//attacker.test/project-invitations/token',
    '/\\attacker.test/project-invitations/token',
    '/dashboard',
    '/project-invitations/token/extra',
  ])('rejects unsafe or unrelated return paths: %s', (value) => {
    expect(getSafeProjectInvitationReturnPath(value)).toBeNull();
  });

  it('stores only a safe invitation route for email verification return', () => {
    expect(storeProjectInvitationReturnPath('/project-invitations/token?tab=details')).toBe('/project-invitations/token?tab=details');
    expect(readProjectInvitationReturnPath()).toBe('/project-invitations/token?tab=details');
    clearProjectInvitationReturnPath();
    expect(readProjectInvitationReturnPath()).toBeNull();
  });
});
