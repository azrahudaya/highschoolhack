const allowedProgramNext = new Set([
  '/app/programs/bekal-10',
  '/app/programs/setting-goal',
  '/app/programs/smart-financial',
]);

export function safeNextPath(value: string | null) {
  if (!value) return '';
  try {
    const decoded = decodeURIComponent(value);
    return allowedProgramNext.has(decoded) ? decoded : '';
  } catch {
    return '';
  }
}

export function storePostOnboardingNext(path: string) {
  if (!path) return;
  window.localStorage.setItem('hsh-post-onboarding-next', path);
}

export function consumePostOnboardingNext() {
  const value = safeNextPath(window.localStorage.getItem('hsh-post-onboarding-next'));
  window.localStorage.removeItem('hsh-post-onboarding-next');
  return value;
}
