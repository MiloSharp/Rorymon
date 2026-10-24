const PROFILES_KEY = 'rorymon-player-profiles';
const ACTIVE_KEY = 'rorymon-active-profile';
const SAVE_KEYS = [
  'rorymon-party', 'rorymon-storage', 'rorymon-collection', 'rorymon-credits',
  'rorymon-roryballs', 'rorymon-ultraroryballs', 'rorymon-quickroryballs',
  'rorymon-defeated-trainers', 'rorymon-testing-refill', 'rorymon-art-quality',
];

const readProfiles = () => {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); }
  catch { return []; }
};

const writeProfiles = (profiles) => localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
const scopedKey = (key, profileId = localStorage.getItem(ACTIVE_KEY)) => profileId ? `rorymon-save:${profileId}:${key}` : key;

export function listProfiles() {
  return readProfiles();
}

export function getActiveProfile() {
  const activeId = localStorage.getItem(ACTIVE_KEY);
  return readProfiles().find((profile) => profile.id === activeId) ?? null;
}

export function setActiveProfile(profileId) {
  if (!readProfiles().some((profile) => profile.id === profileId)) return false;
  localStorage.setItem(ACTIVE_KEY, profileId);
  return true;
}

export function createProfile(name, avatar) {
  const cleanName = String(name || '').trim().slice(0, 18);
  if (!cleanName) throw new Error('Choose a character name.');
  const profile = {
    id: `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    avatar: { body: avatar?.body === 'female' ? 'female' : 'male', hair: ['auburn', 'brown', 'black', 'blonde'].includes(avatar?.hair) ? avatar.hair : 'auburn' },
    createdAt: new Date().toISOString(),
  };
  const profiles = readProfiles();
  profiles.push(profile);
  writeProfiles(profiles);
  localStorage.setItem(ACTIVE_KEY, profile.id);
  return profile;
}

export function ensureLegacyProfile() {
  if (readProfiles().length) return getActiveProfile();
  const hasLegacySave = SAVE_KEYS.some((key) => localStorage.getItem(key) !== null);
  if (!hasLegacySave) return null;
  const profile = createProfile('Mara', { body: 'male', hair: 'auburn' });
  for (const key of SAVE_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) localStorage.setItem(scopedKey(key, profile.id), value);
  }
  return profile;
}

export const gameStorage = {
  getItem(key) { return localStorage.getItem(scopedKey(key)); },
  setItem(key, value) { localStorage.setItem(scopedKey(key), String(value)); },
  removeItem(key) { localStorage.removeItem(scopedKey(key)); },
};

ensureLegacyProfile();
