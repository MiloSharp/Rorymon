import { createBattler, getSpeciesCatalog } from '../battle/combat-engine.js';
import { createProfile, gameStorage, getActiveProfile, listProfiles, setActiveProfile } from '../shared/profile-storage.js';

const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TILE = 32;
const COLS = 40;
const ROWS = 30;
const HERO_WIDTH = 24;
const HERO_HEIGHT = 40;
const INTERIOR_HERO_WIDTH = 48;
const INTERIOR_HERO_HEIGHT = 80;
const map = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const keys = new Set();
const encounter = document.querySelector('#encounter');
const encounterName = document.querySelector('#encounter-name');
const status = document.querySelector('#status');
const terrainLabel = document.querySelector('#terrain-label');
const partyCount = document.querySelector('#party-count');
const collectionCount = document.querySelector('#collection-count');
const storageCount = document.querySelector('#storage-count');
const ballCount = document.querySelector('#ball-count');
const creditCount = document.querySelector('#credit-count');
const partyScreen = document.querySelector('#party-screen');
const partyList = document.querySelector('#party-list');
const storageList = document.querySelector('#storage-list');
const storageSummary = document.querySelector('#storage-summary');
const storageHeading = document.querySelector('.storage-heading');
const shopScreen = document.querySelector('#shop-screen');
const shopMessage = document.querySelector('#shop-message');
const attendantPop = document.querySelector('#attendant-pop');
const attendantPortrait = document.querySelector('#attendant-portrait');
const attendantName = document.querySelector('#attendant-name');
const attendantLine = document.querySelector('#attendant-line');
const healingBall = document.querySelector('#healing-ball');
const profileButton = document.querySelector('#profile-button');
const profileScreen = document.querySelector('#profile-screen');
const profileList = document.querySelector('#profile-list');
const profileForm = document.querySelector('#profile-form');
const bodyChoices = document.querySelector('#body-choices');
const hairChoices = document.querySelector('#hair-choices');
const characterName = document.querySelector('#character-name');
const profileError = document.querySelector('#profile-error');
const wildEncounters = Object.values(getSpeciesCatalog()).map((species) => ({
  id: species.id,
  name: species.name,
  level: species.level,
}));
let pendingEncounter = null;

// Tile values: 0 short grass, 1 tall grass, 2 trail, 3 water, 4 tree, 5 rock.
for (let y = 0; y < ROWS; y += 1) for (let x = 0; x < COLS; x += 1) {
  if (x < 2 || y < 2 || x > COLS - 3 || y > ROWS - 3) map[y][x] = 4;
  if ((x > 4 && x < 15 && y > 5 && y < 12) || (x > 24 && x < 36 && y > 15 && y < 24)) map[y][x] = 1;
  if (y >= 13 && y <= 15) map[y][x] = 2;
  if (x >= 18 && x <= 20) map[y][x] = 2;
}
// Short entrance path from the main trail to the Center, now set east of the road.
for (let y = 10; y <= 12; y += 1) for (let x = 24; x <= 25; x += 1) map[y][x] = 2;
for (let y = 4; y < 11; y += 1) for (let x = 28; x < 36; x += 1) {
  const dx = (x - 31.5) / 4; const dy = (y - 7) / 3.5;
  if (dx * dx + dy * dy < 1) map[y][x] = 3;
}
[[8,4],[15,7],[5,21],[12,25],[24,5],[35,13],[30,26],[22,22]].forEach(([x,y]) => { map[y][x] = 5; });
[[6,3],[12,3],[25,25],[33,24],[3,17],[36,18],[23,8]].forEach(([x,y]) => { map[y][x] = 4; });

const objects = [
  { kind: 'center', x: 22 * TILE, y: 6 * TILE, w: 5 * TILE, h: 4 * TILE, doorX: 24.5 * TILE },
  { kind: 'store', x: 7 * TILE, y: 17 * TILE, w: 4 * TILE, h: 3 * TILE, doorX: 9 * TILE },
  { kind: 'totem', x: 28 * TILE, y: 11 * TILE, w: TILE, h: 2 * TILE },
];
const trainers = [
  { id: 'trail-kellan', name: 'Kellan', x: 15 * TILE, y: 14 * TILE, reward: 180, sprite: 'male' },
  { id: 'trail-nora', name: 'Nora', x: 24 * TILE, y: 14 * TILE, reward: 240, sprite: 'researcher' },
];

const activeProfile = getActiveProfile();
const positionKey = `rorymon-overworld-position:${activeProfile?.id ?? 'guest'}`;
const saved = JSON.parse(sessionStorage.getItem(positionKey) || 'null');
const player = { x: saved?.x ?? 19.5 * TILE, y: saved?.y ?? 17 * TILE, direction: saved?.direction ?? 'south', frame: 0, moving: false, distance: 0 };
const camera = { x: 0, y: 0 };
let paused = false;
let lastTime = performance.now();
let grassTravel = 0;
let encounterCooldown = 120;
let location = 'outside';
let exteriorPosition = null;
let interiorAction = null;
let attendantTimer = null;
let healingTimer = null;
let storageManagementOpen = false;
let nearbyTrainer = null;
let selectedAvatar = { body: 'male', hair: 'auburn' };

const bodyOptions = [{ body: 'male', label: 'Boy' }, { body: 'female', label: 'Girl' }];
const hairOptions = ['auburn', 'brown', 'black', 'blonde'];
const avatarStrip = ({ body, hair }, direction = 'south') => `../../assets/characters/previews/${body}-ranger-walk-${direction}-strip-hair-${hair}-v1.png`;
const avatarStyle = (avatar) => `--avatar:url('${avatarStrip(avatar)}')`;

function updateProfileButton() {
  const profile = getActiveProfile();
  profileButton.textContent = profile ? `Player: ${profile.name}` : 'Choose player';
}

function renderAvatarChoices() {
  bodyChoices.replaceChildren(...bodyOptions.map(({ body, label }) => {
    const avatar = { body, hair: selectedAvatar.hair };
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `avatar-choice ${body === selectedAvatar.body ? 'selected' : ''}`;
    button.dataset.body = body;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<span style="${avatarStyle(avatar)}"></span><small>${label}</small>`;
    return button;
  }));
  hairChoices.replaceChildren(...hairOptions.map((hair) => {
    const avatar = { body: selectedAvatar.body, hair };
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `avatar-choice ${hair === selectedAvatar.hair ? 'selected' : ''}`;
    button.dataset.hair = hair;
    button.setAttribute('aria-label', `${hair} hair`);
    button.innerHTML = `<span style="${avatarStyle(avatar)}"></span><small>${hair}</small>`;
    return button;
  }));
}

function showProfiles(required = false) {
  const profiles = listProfiles();
  profileList.replaceChildren(...profiles.map((profile) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `profile-choice ${profile.id === getActiveProfile()?.id ? 'active' : ''}`;
    button.dataset.profileId = profile.id;
    button.innerHTML = `<span class="profile-avatar" style="${avatarStyle(profile.avatar)}"></span><span><strong>${profile.name}</strong><small>${profile.avatar.hair} hair · ${profile.avatar.body}</small></span>`;
    return button;
  }));
  profileForm.hidden = true;
  document.querySelector('#new-profile').hidden = false;
  document.querySelector('#close-profiles').hidden = required;
  profileScreen.hidden = false;
  paused = true;
}

function beginProfileCreation() {
  selectedAvatar = { body: 'male', hair: 'auburn' };
  characterName.value = '';
  profileError.textContent = '';
  renderAvatarChoices();
  profileForm.hidden = false;
  document.querySelector('#new-profile').hidden = true;
  characterName.focus();
}

function showAttendant(kind, line, persistent = false) {
  const center = kind === 'center';
  attendantPortrait.src = center
    ? '../../assets/characters/npcs/center-attendant-front-v1.png'
    : '../../assets/characters/npcs/shopkeeper-front-v1.png';
  attendantPortrait.alt = center ? 'Rorymon Center attendant' : 'Sprucewater shopkeeper';
  attendantName.textContent = center ? 'Center Attendant' : 'Shopkeeper';
  attendantLine.textContent = line;
  attendantPop.hidden = true;
  void attendantPop.offsetWidth;
  attendantPop.hidden = false;
  clearTimeout(attendantTimer);
  if (!persistent) attendantTimer = setTimeout(() => { attendantPop.hidden = true; }, 1900);
}

function pulseHealingMachine() {
  healingBall.hidden = true;
  void healingBall.offsetWidth;
  healingBall.hidden = false;
  clearTimeout(healingTimer);
  healingTimer = setTimeout(() => { healingBall.hidden = true; }, 1550);
}

function refreshInventory() {
  const collection = JSON.parse(gameStorage.getItem('rorymon-collection') || '[]');
  const storage = JSON.parse(gameStorage.getItem('rorymon-storage') || '[]');
  let party = JSON.parse(gameStorage.getItem('rorymon-party') || 'null');
  if (!Array.isArray(party) || party.length === 0) {
    const progress = JSON.parse(sessionStorage.getItem(`rorymon-demo-progress:${getActiveProfile()?.id ?? 'guest'}`) || 'null');
    const level = progress?.level ?? 5;
    party = ['mossmoose', 'branchler', 'cubice'].map((id) => ({ id, level, variant: null }));
    gameStorage.setItem('rorymon-party', JSON.stringify(party));
  }
  const storedBalls = gameStorage.getItem('rorymon-roryballs');
  let balls = storedBalls === null ? 5 : Math.max(0, Number(storedBalls));
  const ultraBalls = Math.max(0, Number(gameStorage.getItem('rorymon-ultraroryballs') || 0));
  const quickBalls = Math.max(0, Number(gameStorage.getItem('rorymon-quickroryballs') || 0));
  if (balls === 0 && gameStorage.getItem('rorymon-testing-refill') !== '1') {
    balls = 10;
    gameStorage.setItem('rorymon-roryballs', '10');
    gameStorage.setItem('rorymon-testing-refill', '1');
  }
  const storedCredits = gameStorage.getItem('rorymon-credits');
  const credits = storedCredits === null ? 500 : Math.max(0, Number(storedCredits));
  if (storedBalls === null) gameStorage.setItem('rorymon-roryballs', '5');
  if (storedCredits === null) gameStorage.setItem('rorymon-credits', '500');
  partyCount.textContent = `Party: ${party.length}/6`;
  collectionCount.textContent = `Caught: ${collection.length}`;
  storageCount.textContent = `Storage: ${storage.length}`;
  creditCount.textContent = `Credits: ${credits}`;
  ballCount.textContent = `Balls: ${balls} · Ultra: ${ultraBalls} · Quick: ${quickBalls}`;
}
if (activeProfile) refreshInventory();
updateProfileButton();

function partySprite(battler) {
  if (battler.spriteKey === 'totammpol-moose-bear-goat') {
    return { src: '../../assets/totammpol-moose-bear-goat-battle-art-front-transparent.png', highQuality: true };
  }
  if (battler.spriteKey === 'totammpol-eagle-bear-goat') {
    return { src: '../../assets/totammpol-eagle-bear-goat-sprite-front-transparent.png', highQuality: true };
  }
  return { src: `../../assets/${battler.spriteKey}-sprite-front-transparent.png`, highQuality: false };
}

function showParty(manageStorage = false) {
  storageManagementOpen = manageStorage;
  const savedParty = JSON.parse(gameStorage.getItem('rorymon-party') || '[]');
  const savedStorage = JSON.parse(gameStorage.getItem('rorymon-storage') || '[]');
  partyList.replaceChildren(...savedParty.map((saved, index) => {
    const battler = createBattler('player', saved.name, saved.level ?? 5, saved.id, saved.variant ?? null);
    if (Number.isFinite(Number(saved.hp))) battler.hp = Math.max(0, Math.min(battler.maxHp, Number(saved.hp)));
    battler.status = saved.status ?? null;
    if (Array.isArray(saved.moves)) {
      for (const move of battler.moves) {
        const savedMove = saved.moves.find((candidate) => candidate.id === move.id);
        if (savedMove && Number.isFinite(Number(savedMove.pp))) move.pp = Math.max(0, Math.min(move.maxPp, Number(savedMove.pp)));
      }
    }
    const card = document.createElement('article');
    card.className = 'party-card';
    const sprite = partySprite(battler);
    const types = [battler.type, battler.secondaryType].filter(Boolean).join(' / ');
    const variant = saved.variant ? `${saved.variant.top} · ${saved.variant.middle} · ${saved.variant.bottom}` : '';
    const condition = battler.status ? ` · ${battler.status.id.toUpperCase()}` : '';
    const storageAction = manageStorage ? `<div class="storage-actions"><button type="button" data-store-party-index="${index}" ${savedParty.length <= 1 ? 'disabled' : ''}>Move to storage</button></div>` : '';
    card.innerHTML = `<div class="party-number">${index + 1}</div><img class="${sprite.highQuality ? 'high-quality-sprite' : ''}" src="${sprite.src}" alt="${battler.name}"><div class="party-details"><div class="party-name"><h2>${battler.name}</h2><strong>Lv. ${battler.level}</strong></div><div class="type-line"><span>${types}</span>${variant ? `<small>${variant}</small>` : ''}</div><div class="stats-grid"><span>HP${condition} <b>${battler.hp} / ${battler.maxHp}</b></span><span>Attack <b>${battler.attack}</b></span><span>Defense <b>${battler.defense}</b></span><span>Speed <b>${battler.speed}</b></span></div><div class="known-moves">${battler.moves.map((move) => `<span class="move-${move.type}">${move.name}<small>${move.type} · PP ${move.pp}/${move.maxPp}</small></span>`).join('')}</div>${storageAction}</div>`;
    return card;
  }));
  storageSummary.textContent = `${savedStorage.length} stored`;
  storageHeading.hidden = !manageStorage;
  storageList.hidden = !manageStorage;
  if (savedStorage.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'storage-empty';
    empty.textContent = 'Your storage box is empty.';
    storageList.replaceChildren(empty);
  } else {
    storageList.replaceChildren(...savedStorage.map((saved, storageIndex) => {
      const battler = createBattler('player', saved.name, saved.level ?? 5, saved.id, saved.variant ?? null);
      const card = document.createElement('article');
      card.className = 'party-card storage-card';
      const sprite = partySprite(battler);
      const types = [battler.type, battler.secondaryType].filter(Boolean).join(' / ');
      const replacementOptions = savedParty.map((member, partyIndex) => `<option value="${partyIndex}">${partyIndex + 1}. ${member.name ?? member.id}</option>`).join('');
      const controls = savedParty.length < 6
        ? `<button type="button" data-storage-index="${storageIndex}">Add to party</button>`
        : `<label>Exchange with <select data-replacement>${replacementOptions}</select></label><button type="button" data-storage-index="${storageIndex}">Swap</button>`;
      card.innerHTML = `<img class="${sprite.highQuality ? 'high-quality-sprite' : ''}" src="${sprite.src}" alt="${battler.name}"><div class="party-details"><div class="party-name"><h2>${battler.name}</h2><strong>Lv. ${battler.level}</strong></div><div class="type-line"><span>${types}</span></div><div class="stats-grid"><span>HP <b>${Number.isFinite(Number(saved.hp)) ? saved.hp : battler.maxHp} / ${battler.maxHp}</b></span><span>Attack <b>${battler.attack}</b></span><span>Defense <b>${battler.defense}</b></span><span>Speed <b>${battler.speed}</b></span></div><div class="storage-actions">${controls}</div></div>`;
      return card;
    }));
  }
  partyScreen.hidden = false;
  paused = true;
  document.querySelector('#close-party').focus();
}

function useStoragePc() {
  showParty(true);
  status.textContent = 'Storage PC opened.';
  document.querySelector('.storage-heading')?.scrollIntoView({ block: 'start' });
}

function partyReadyMember(saved) {
  const battler = createBattler('player', saved.name, saved.level ?? 5, saved.id, saved.variant ?? null);
  return {
    id: saved.id,
    name: saved.name ?? battler.name,
    level: saved.level ?? battler.level,
    variant: saved.variant ?? null,
    hp: Number.isFinite(Number(saved.hp)) ? Math.max(0, Math.min(battler.maxHp, Number(saved.hp))) : battler.maxHp,
    status: saved.status ?? null,
    moves: battler.moves.map((move) => {
      const savedMove = saved.moves?.find((candidate) => candidate.id === move.id);
      return { id: move.id, pp: Number.isFinite(Number(savedMove?.pp)) ? Math.max(0, Math.min(move.maxPp, Number(savedMove.pp))) : move.maxPp };
    }),
  };
}

function moveStoredRorymonToParty(storageIndex, partyIndex = null) {
  if (!storageManagementOpen || location !== 'center') return;
  const party = JSON.parse(gameStorage.getItem('rorymon-party') || '[]');
  const storage = JSON.parse(gameStorage.getItem('rorymon-storage') || '[]');
  if (!storage[storageIndex]) return;
  const incoming = partyReadyMember(storage[storageIndex]);
  if (party.length < 6) {
    party.push(incoming);
    storage.splice(storageIndex, 1);
  } else {
    const replacementIndex = Number(partyIndex);
    if (!Number.isInteger(replacementIndex) || !party[replacementIndex]) return;
    const outgoing = partyReadyMember(party[replacementIndex]);
    party[replacementIndex] = incoming;
    storage[storageIndex] = { ...outgoing, addedToParty: false, storedAt: new Date().toISOString() };
  }
  gameStorage.setItem('rorymon-party', JSON.stringify(party));
  gameStorage.setItem('rorymon-storage', JSON.stringify(storage));
  refreshInventory();
  showParty(true);
}

function movePartyRorymonToStorage(partyIndex) {
  if (!storageManagementOpen || location !== 'center') return;
  const party = JSON.parse(gameStorage.getItem('rorymon-party') || '[]');
  const storage = JSON.parse(gameStorage.getItem('rorymon-storage') || '[]');
  if (party.length <= 1 || !party[partyIndex]) return;
  const [outgoing] = party.splice(partyIndex, 1);
  storage.push({ ...partyReadyMember(outgoing), addedToParty: false, storedAt: new Date().toISOString() });
  gameStorage.setItem('rorymon-party', JSON.stringify(party));
  gameStorage.setItem('rorymon-storage', JSON.stringify(storage));
  refreshInventory();
  showParty(true);
}

function hideParty() {
  partyScreen.hidden = true;
  storageManagementOpen = false;
  paused = false;
  document.querySelector('#open-party').focus();
}

function showShop() {
  shopScreen.hidden = false;
  paused = true;
  shopMessage.textContent = 'Welcome! Stock up before heading into the tall grass.';
  document.querySelector('#buy-roryballs').focus();
}

function hideShop() {
  shopScreen.hidden = true;
  attendantPop.hidden = true;
  clearTimeout(attendantTimer);
  paused = false;
}

function buyRoryballs(type = 'standard', count = 5, cost = 100) {
  const credits = Math.max(0, Number(gameStorage.getItem('rorymon-credits') || 0));
  if (credits < cost) {
    shopMessage.textContent = `You need ${cost} credits for that bundle.`;
    return;
  }
  const storageKey = type === 'ultra' ? 'rorymon-ultraroryballs' : type === 'quick' ? 'rorymon-quickroryballs' : 'rorymon-roryballs';
  const balls = Math.max(0, Number(gameStorage.getItem(storageKey) || 0));
  gameStorage.setItem('rorymon-credits', String(credits - cost));
  gameStorage.setItem(storageKey, String(balls + count));
  const label = type === 'ultra' ? 'Ultraroryballs' : type === 'quick' ? 'Quickroryballs' : 'Roryballs';
  shopMessage.textContent = `You received ${count} ${label}!`;
  refreshInventory();
}

function healParty() {
  const savedParty = JSON.parse(gameStorage.getItem('rorymon-party') || '[]');
  if (!Array.isArray(savedParty) || savedParty.length === 0) {
    status.textContent = 'You do not have any Rorymon to heal.';
    return;
  }
  const healedParty = savedParty.map((saved) => {
    const battler = createBattler('player', saved.name, saved.level ?? 5, saved.id, saved.variant ?? null);
    return {
      ...saved,
      hp: battler.maxHp,
      status: null,
      moves: battler.moves.map((move) => ({ id: move.id, pp: move.maxPp })),
    };
  });
  gameStorage.setItem('rorymon-party', JSON.stringify(healedParty));
  status.textContent = 'Your party is fully healed! HP, status, and PP were restored.';
  refreshInventory();
}

const strips = {};
function loadPlayerStrips(profile = getActiveProfile()) {
  const avatar = profile?.avatar ?? { body: 'male', hair: 'auburn' };
  for (const direction of ['north', 'south', 'east', 'west']) {
    const image = new Image();
    image.src = avatarStrip(avatar, direction);
    strips[direction] = image;
  }
}
loadPlayerStrips();
const trainerSprites = {};
for (const [kind, source] of Object.entries({
  male: '../../assets/characters/previews/male-ranger-walk-south-strip-hair-blonde-v1.png',
  female: '../../assets/characters/previews/female-ranger-walk-south-strip-hair-black-v1.png',
  researcher: '../../assets/characters/npcs/field-researcher-front-v1.png',
})) {
  const image = new Image();
  image.src = source;
  trainerSprites[kind] = image;
}
const environment = {};
for (const name of ['short-grass','tall-grass','trail','water','spruce','boulder','story-pole','center','store']) {
  const image = new Image();
  image.src = `../../assets/environment/overworld/${name}.png`;
  environment[name] = image;
}
const interiors = {};
for (const kind of ['center', 'store']) {
  const image = new Image();
  image.src = `../../assets/environment/overworld/${kind}-interior-v1.png`;
  interiors[kind] = image;
}
const interiorNpcs = {};
for (const [kind, file] of Object.entries({ center: 'center-attendant-front-v1.png', store: 'shopkeeper-front-v1.png' })) {
  const image = new Image();
  image.src = `../../assets/characters/npcs/${file}`;
  interiorNpcs[kind] = image;
}

function tileAtWorld(x, y) {
  const tx = Math.floor(x / TILE); const ty = Math.floor(y / TILE);
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return 4;
  return map[ty][tx];
}

function blocked(x, y) {
  if (location !== 'outside') {
    const halfW = 10; const halfH = 7;
    if (x - halfW < 52 || x + halfW > canvas.width - 52 || y - halfH < 82 || y + halfH > canvas.height - 24) return true;
    return y - halfH < 214;
  }
  const halfW = 10; const halfH = 7;
  const points = [[x-halfW,y-halfH],[x+halfW,y-halfH],[x-halfW,y+halfH],[x+halfW,y+halfH]];
  if (points.some(([px,py]) => [3,4,5].includes(tileAtWorld(px,py)))) return true;
  if (trainers.some((trainer) => Math.abs(x - trainer.x) < 19 && Math.abs(y - trainer.y) < 18)) return true;
  return objects.some((object) => {
    const doorway = object.kind !== 'totem' && x > object.doorX - 17 && x < object.doorX + 17 && y > object.y + object.h - 12;
    return !doorway && x + halfW > object.x && x - halfW < object.x + object.w && y + halfH > object.y && y - halfH < object.y + object.h;
  });
}

function enterBuilding(kind, building) {
  exteriorPosition = { x: building.doorX, y: building.y + building.h + 20 };
  location = kind;
  player.x = canvas.width / 2;
  player.y = canvas.height - 62;
  player.direction = 'north';
  player.moving = false;
  terrainLabel.textContent = kind === 'store' ? 'Sprucewater Store' : 'Rorymon Center';
  status.textContent = kind === 'store'
    ? 'Walk to the counter to shop.'
    : 'Walk to the counter to heal your party.';
}

function leaveBuilding() {
  const previous = location;
  location = 'outside';
  player.x = exteriorPosition?.x ?? player.x;
  player.y = exteriorPosition?.y ?? player.y;
  player.direction = 'south';
  player.moving = false;
  interiorAction = null;
  terrainLabel.textContent = 'Trail';
  status.textContent = `You left the ${previous === 'store' ? 'Shop' : 'Rorymon Center'}.`;
}

function movePlayer(dx, dy) {
  const nextX = player.x + dx; const nextY = player.y + dy;
  if (!blocked(nextX, player.y)) player.x = nextX;
  if (!blocked(player.x, nextY)) player.y = nextY;
}

function triggerEncounter() {
  paused = true;
  pendingEncounter = wildEncounters[Math.floor(Math.random() * wildEncounters.length)];
  encounterName.textContent = `A wild ${pendingEncounter.name} appeared!`;
  encounter.hidden = false;
  status.textContent = `Wild ${pendingEncounter.name} encounter.`;
  sessionStorage.setItem(positionKey, JSON.stringify({ x: player.x, y: player.y, direction: player.direction }));
}

function challengeTrainer(trainer) {
  const defeated = JSON.parse(gameStorage.getItem('rorymon-defeated-trainers') || '[]');
  if (defeated.includes(trainer.id)) {
    status.textContent = `${trainer.name}: “That was a good battle!”`;
    return;
  }
  sessionStorage.setItem(positionKey, JSON.stringify({ x: player.x, y: player.y, direction: player.direction }));
  const params = new URLSearchParams({ battle: '1', trainer: trainer.id, trainerName: trainer.name, reward: String(trainer.reward), from: 'overworld' });
  window.location.href = `../battle/?${params}`;
}

function update(dt) {
  if (paused) return;
  let dx = 0; let dy = 0;
  if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
  if (keys.has('arrowright') || keys.has('d')) dx += 1;
  if (keys.has('arrowup') || keys.has('w')) dy -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dy += 1;
  if (dx !== 0) dy = 0;
  player.moving = dx !== 0 || dy !== 0;
  if (!player.moving) { player.frame = 0; return; }
  if (Math.abs(dx) > Math.abs(dy)) player.direction = dx > 0 ? 'east' : 'west';
  else player.direction = dy > 0 ? 'south' : 'north';
  const running = keys.has('shift');
  const speed = running ? 190 : 108;
  const travelled = speed * dt;
  movePlayer(dx * travelled, dy * travelled);
  player.distance += travelled;
  player.frame = Math.floor(player.distance / (running ? 11 : 15)) % 8;
  if (location !== 'outside') {
    interiorAction = player.y < 252
      ? (location === 'store' ? 'shop' : player.x > canvas.width - 210 ? 'storage' : 'heal')
      : null;
    status.textContent = interiorAction
      ? (interiorAction === 'shop' ? 'Press E to shop for Roryballs.' : interiorAction === 'storage' ? 'Press E to use the storage PC.' : 'Press E to heal your party.')
      : (player.y > canvas.height - 82 ? 'Walk through the doorway to leave.' : status.textContent);
    if (player.y > canvas.height - 48 && Math.abs(player.x - canvas.width / 2) < 42) leaveBuilding();
    return;
  }
  encounterCooldown = Math.max(0, encounterCooldown - travelled);
  const terrain = tileAtWorld(player.x, player.y);
  terrainLabel.textContent = terrain === 1 ? 'Tall grass' : terrain === 2 ? 'Trail' : 'Taiga';
  if (terrain === 1) {
    grassTravel += travelled;
    if (grassTravel >= TILE) {
      grassTravel -= TILE;
      if (encounterCooldown <= 0 && Math.random() < 0.13) triggerEncounter();
    }
  } else grassTravel = 0;
  for (const building of objects.filter((object) => object.kind === 'store' || object.kind === 'center')) {
    const atDoor = Math.abs(player.x - building.doorX) < 19 && player.y < building.y + building.h + 12 && player.y > building.y + building.h - 24;
    if (atDoor && player.direction === 'north') {
      enterBuilding(building.kind, building);
      return;
    }
  }
  nearbyTrainer = trainers.find((trainer) => Math.hypot(player.x - trainer.x, player.y - trainer.y) < 44) ?? null;
  if (nearbyTrainer) {
    const defeated = JSON.parse(gameStorage.getItem('rorymon-defeated-trainers') || '[]').includes(nearbyTrainer.id);
    status.textContent = defeated
      ? `${nearbyTrainer.name} has already been defeated.`
      : `Press E to challenge ${nearbyTrainer.name} for ${nearbyTrainer.reward} credits.`;
  }
}

function drawTile(tile, x, y, tx, ty) {
  const terrainName = tile === 1 ? 'tall-grass' : tile === 2 ? 'trail' : tile === 3 ? 'water' : 'short-grass';
  if (environment[terrainName]?.complete) ctx.drawImage(environment[terrainName],x,y,TILE,TILE);
  else { ctx.fillStyle=tile===2?'#c6a66d':tile===3?'#4d91a2':tile===1?'#4f8148':'#74a35b';ctx.fillRect(x,y,TILE,TILE); }
  if (tile === 4 && environment.spruce?.complete) { ctx.drawImage(environment.spruce,x-16,y-64,64,96); return; }
  if (tile === 5 && environment.boulder?.complete) { ctx.drawImage(environment.boulder,x-10,y-10,52,42); return; }
  if (environment[terrainName]?.complete) return;
  if (tile === 2) {
    ctx.fillStyle = '#c6a66d'; ctx.fillRect(x,y,TILE,TILE);
    ctx.fillStyle = '#b18d59'; ctx.fillRect(x+((tx+ty)%3)*8,y+7,7,3); ctx.fillRect(x+20,y+23,8,3);
    return;
  }
  if (tile === 3) {
    ctx.fillStyle = '#4d91a2'; ctx.fillRect(x,y,TILE,TILE);
    ctx.fillStyle = '#78b8bc'; ctx.fillRect(x+4,y+8+(tx%2)*8,18,3); ctx.fillRect(x+13,y+25,15,2);
    return;
  }
  ctx.fillStyle = tile === 1 ? '#4f8148' : '#74a35b'; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = tile === 1 ? '#315f38' : '#5b8d4b';
  const seed = (tx * 17 + ty * 31) % 13;
  ctx.fillRect(x+5+seed,y+7,3,tile===1?14:5); ctx.fillRect(x+20-seed/2,y+19,3,tile===1?11:4);
  if (tile === 4) {
    ctx.fillStyle='#533d2c';ctx.fillRect(x+13,y+18,7,14);ctx.fillStyle='#1f5638';ctx.beginPath();ctx.moveTo(x+16,y+1);ctx.lineTo(x+3,y+24);ctx.lineTo(x+29,y+24);ctx.fill();ctx.fillStyle='#34714a';ctx.beginPath();ctx.moveTo(x+16,y+5);ctx.lineTo(x+7,y+19);ctx.lineTo(x+25,y+19);ctx.fill();
  } else if (tile === 5) {
    ctx.fillStyle='#6f7a70';ctx.beginPath();ctx.moveTo(x+5,y+27);ctx.lineTo(x+9,y+10);ctx.lineTo(x+23,y+6);ctx.lineTo(x+29,y+26);ctx.fill();ctx.fillStyle='#9aa49a';ctx.fillRect(x+11,y+11,9,4);
  }
}

function drawObject(object) {
  const x = Math.round(object.x-camera.x); const y = Math.round(object.y-camera.y);
  if (object.kind === 'totem') {
    if (environment['story-pole']?.complete) { ctx.drawImage(environment['story-pole'],x-8,y-40,48,104); return; }
    ctx.fillStyle='#5a3424';ctx.fillRect(x+8,y,16,64);ctx.fillStyle='#d29039';ctx.fillRect(x+5,y+5,22,10);ctx.fillRect(x+4,y+26,24,10);ctx.fillRect(x+6,y+47,20,10);ctx.fillStyle='#45a1a0';ctx.fillRect(x+11,y+8,4,4);ctx.fillRect(x+19,y+29,4,4);ctx.fillRect(x+12,y+50,4,4);return;
  }
  if (environment[object.kind]?.complete) { ctx.drawImage(environment[object.kind],x,y,object.w,object.h); return; }
  const center = object.kind === 'center';
  ctx.fillStyle='#5e4735';ctx.fillRect(x,y+24,object.w,object.h-24);
  ctx.fillStyle=center?'#d9eee8':'#eadcb4';ctx.fillRect(x+8,y+31,object.w-16,object.h-39);
  ctx.fillStyle=center?'#b94e46':'#457a63';ctx.beginPath();ctx.moveTo(x-6,y+31);ctx.lineTo(x+object.w/2,y);ctx.lineTo(x+object.w+6,y+31);ctx.fill();
  ctx.fillStyle='#183a31';ctx.fillRect(x+object.w/2-13,y+object.h-32,26,32);ctx.fillStyle='#8ec6c0';ctx.fillRect(x+18,y+51,24,19);ctx.fillRect(x+object.w-42,y+51,24,19);
  ctx.fillStyle='#fff5d7';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText(center?'RORYMON CENTER':'STORE',x+object.w/2,y+28);
}

function drawTrainer(trainer) {
  const image = trainerSprites[trainer.sprite];
  const x = Math.round(trainer.x - camera.x - HERO_WIDTH / 2);
  const y = Math.round(trainer.y - camera.y - HERO_HEIGHT + 4);
  if (image?.complete) ctx.drawImage(image, 0, 0, 96, 160, x, y, HERO_WIDTH, HERO_HEIGHT);
  const defeated = JSON.parse(gameStorage.getItem('rorymon-defeated-trainers') || '[]').includes(trainer.id);
  if (!defeated) {
    ctx.fillStyle = '#fff2a8'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', Math.round(trainer.x - camera.x), y - 4);
  }
}

function drawInterior() {
  const store = location === 'store';
  const artwork = interiors[location];
  if (artwork?.complete && artwork.naturalWidth > 0) {
    ctx.drawImage(artwork, 0, 0, canvas.width, canvas.height);
    return;
  }
  ctx.fillStyle = store ? '#d9c795' : '#d5ebe5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = store ? '#8d7047' : '#6c988d';
  ctx.fillRect(0, 0, canvas.width, 78);
  ctx.fillRect(0, 0, 50, canvas.height);
  ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
  ctx.fillStyle = store ? '#b59a69' : '#a9cec4';
  for (let y = 86; y < canvas.height; y += 32) {
    for (let x = 58; x < canvas.width - 50; x += 32) {
      if ((x / 32 + y / 32) % 2 < 1) ctx.fillRect(x, y, 32, 32);
    }
  }
  ctx.fillStyle = '#5a3f2c';
  ctx.fillRect(80, 112, canvas.width - 160, 94);
  ctx.fillStyle = store ? '#ede0b8' : '#eef8f5';
  ctx.fillRect(92, 122, canvas.width - 184, 62);
  ctx.fillStyle = store ? '#a64f3b' : '#b94e46';
  ctx.fillRect(108, 92, canvas.width - 216, 28);
  ctx.fillStyle = '#17362b';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(store ? 'RORYBALL COUNTER' : 'HEALING COUNTER', canvas.width / 2, 160);
  if (!store) {
    ctx.fillStyle = '#243b49';
    ctx.fillRect(canvas.width - 174, 102, 82, 78);
    ctx.fillStyle = '#73cbd0';
    ctx.fillRect(canvas.width - 164, 112, 62, 40);
    ctx.fillStyle = '#e9fbff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('STORAGE', canvas.width - 133, 136);
    ctx.fillStyle = '#d7c685';
    ctx.fillRect(canvas.width - 151, 160, 36, 8);
  }
  ctx.fillStyle = '#27483a';
  ctx.fillRect(canvas.width / 2 - 38, canvas.height - 26, 76, 26);
  ctx.fillStyle = '#fff5d7';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('EXIT', canvas.width / 2, canvas.height - 8);
}

function drawInteriorNpc() {
  const npc = interiorNpcs[location];
  if (!npc?.complete || npc.naturalWidth === 0) return;
  const centerX = 434;
  const top = location === 'store' ? 53 : 84;
  const width = 62; const height = 78;
  if (location === 'center') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, 141);
    ctx.clip();
  }
  ctx.drawImage(npc, 0, 0, npc.naturalWidth, Math.round(npc.naturalHeight * 0.64), centerX - width / 2, top, width, height);
  if (location === 'center') ctx.restore();
}

function drawInteriorForeground() {
  const artwork = interiors[location];
  if (!artwork?.complete || artwork.naturalWidth === 0) return;
  const foregroundY = 132;
  const sourceY = Math.round((foregroundY / canvas.height) * artwork.naturalHeight);
  ctx.drawImage(
    artwork,
    0, sourceY, artwork.naturalWidth, artwork.naturalHeight - sourceY,
    0, foregroundY, canvas.width, canvas.height - foregroundY,
  );
}

function drawPlayerSprite(image, x, y, width, height) {
  if (!image.complete) return;
  ctx.drawImage(image, player.frame * 96, 0, 96, 160, x, y, width, height);
}

function render() {
  if (location !== 'outside') {
    drawInterior();
    if (location === 'center') {
      drawInteriorForeground();
      drawInteriorNpc();
    } else {
      drawInteriorNpc();
      drawInteriorForeground();
    }
    const image = strips[player.direction];
    const px = Math.round(player.x - INTERIOR_HERO_WIDTH / 2); const py = Math.round(player.y - INTERIOR_HERO_HEIGHT + 8);
    drawPlayerSprite(image, px, py, INTERIOR_HERO_WIDTH, INTERIOR_HERO_HEIGHT);
    return;
  }
  camera.x = Math.max(0, Math.min(COLS*TILE-canvas.width, player.x-canvas.width/2));
  camera.y = Math.max(0, Math.min(ROWS*TILE-canvas.height, player.y-canvas.height/2));
  const startX=Math.floor(camera.x/TILE); const startY=Math.floor(camera.y/TILE);
  for(let y=startY;y<=Math.ceil((camera.y+canvas.height)/TILE);y+=1) for(let x=startX;x<=Math.ceil((camera.x+canvas.width)/TILE);x+=1){if(map[y]?.[x]!==undefined)drawTile(map[y][x],Math.floor(x*TILE-camera.x),Math.floor(y*TILE-camera.y),x,y);}
  objects.filter((o)=>o.y+o.h<player.y+8).forEach(drawObject);
  trainers.filter((trainer)=>trainer.y<player.y).forEach(drawTrainer);
  const image=strips[player.direction]; const px=Math.round(player.x-camera.x-HERO_WIDTH/2); const py=Math.round(player.y-camera.y-HERO_HEIGHT+4);
  drawPlayerSprite(image,px,py,HERO_WIDTH,HERO_HEIGHT);
  trainers.filter((trainer)=>trainer.y>=player.y).forEach(drawTrainer);
  objects.filter((o)=>o.y+o.h>=player.y+8).forEach(drawObject);
}

function loop(time) { const dt=Math.min(0.04,(time-lastTime)/1000); lastTime=time; update(dt); render(); requestAnimationFrame(loop); }
window.addEventListener('keydown',(event)=>{const key=event.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','shift'].includes(key)){event.preventDefault();keys.add(key);}});
window.addEventListener('keydown',(event)=>{if(event.key.toLowerCase()==='e'&&!paused){if(location==='outside'&&nearbyTrainer){event.preventDefault();challengeTrainer(nearbyTrainer);}else if(interiorAction){event.preventDefault();if(interiorAction==='heal'){showAttendant('center','Your Rorymon are fully restored!');pulseHealingMachine();healParty();}else if(interiorAction==='shop'){showAttendant('store','Welcome! Let me show you today’s supplies.',true);showShop();}else if(interiorAction==='storage')useStoragePc();}}});
window.addEventListener('keyup',(event)=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
document.querySelector('#dismiss-encounter').addEventListener('click',()=>{encounter.hidden=true;pendingEncounter=null;paused=false;encounterCooldown=5*TILE;status.textContent='The grass settles. Keep exploring.';});
document.querySelector('#enter-battle').addEventListener('click',()=>{const species=pendingEncounter?.id??'mossmoose';const level=pendingEncounter?.level??5;window.location.href=`../battle/?battle=1&wild=1&from=overworld&species=${encodeURIComponent(species)}&wildLevel=${level}`;});
document.querySelector('#open-party').addEventListener('click', () => showParty(false));
document.querySelector('#close-party').addEventListener('click', hideParty);
partyScreen.addEventListener('click', (event) => { if (event.target === partyScreen) hideParty(); });
partyList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-store-party-index]');
  if (button && !button.disabled) movePartyRorymonToStorage(Number(button.dataset.storePartyIndex));
});
storageList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-storage-index]');
  if (!button) return;
  const card = button.closest('.storage-card');
  const replacement = card.querySelector('[data-replacement]');
  moveStoredRorymonToParty(Number(button.dataset.storageIndex), replacement?.value ?? null);
});
document.querySelector('#close-shop').addEventListener('click', hideShop);
document.querySelector('#buy-roryballs').addEventListener('click', () => buyRoryballs('standard', 5, 100));
document.querySelector('#buy-ultraroryballs').addEventListener('click', () => buyRoryballs('ultra', 3, 300));
document.querySelector('#buy-quickroryballs').addEventListener('click', () => buyRoryballs('quick', 3, 240));
shopScreen.addEventListener('click', (event) => { if (event.target === shopScreen) hideShop(); });
profileButton.addEventListener('click', () => showProfiles(false));
document.querySelector('#new-profile').addEventListener('click', beginProfileCreation);
document.querySelector('#cancel-profile').addEventListener('click', () => {
  profileForm.hidden = true;
  document.querySelector('#new-profile').hidden = false;
});
document.querySelector('#close-profiles').addEventListener('click', () => {
  if (!getActiveProfile()) return;
  profileScreen.hidden = true;
  paused = false;
});
profileList.addEventListener('click', (event) => {
  const choice = event.target.closest('[data-profile-id]');
  if (!choice || !setActiveProfile(choice.dataset.profileId)) return;
  window.location.reload();
});
bodyChoices.addEventListener('click', (event) => {
  const choice = event.target.closest('[data-body]');
  if (!choice) return;
  selectedAvatar = { ...selectedAvatar, body: choice.dataset.body };
  renderAvatarChoices();
});

hairChoices.addEventListener('click', (event) => {
  const choice = event.target.closest('[data-hair]');
  if (!choice) return;
  selectedAvatar = { ...selectedAvatar, hair: choice.dataset.hair };
  renderAvatarChoices();
});
profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    createProfile(characterName.value, selectedAvatar);
    window.location.reload();
  } catch (error) {
    profileError.textContent = error.message;
  }
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !partyScreen.hidden) hideParty(); else if (event.key === 'Escape' && !shopScreen.hidden) hideShop(); });
if (!activeProfile) showProfiles(true);
requestAnimationFrame(loop);
