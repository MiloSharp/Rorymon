import { Battle, STATUS_CONDITIONS } from './combat-engine.js';
import { BattleMusic } from './battle-music.js';
import { gameStorage, getActiveProfile } from '../shared/profile-storage.js';

const query = new URLSearchParams(window.location.search);
const highLevel = query.get('level') === '30';
const playerProfile = getActiveProfile();
const progressKey = `rorymon-demo-progress:${playerProfile?.id ?? 'guest'}`;
const savedProgress = JSON.parse(sessionStorage.getItem(progressKey) || 'null');
const progression = highLevel ? { level: 30, exp: 0 } : (savedProgress ?? { level: 5, exp: 50 });
const wildBattle = query.has('wild');
const trainerBattle = query.has('trainer');
const trainerId = query.get('trainer');
const trainerName = query.get('trainerName') || 'Kellan';
const playerTrainerName = playerProfile?.name || 'Mara';
const trainerReward = Math.max(0, Number(query.get('reward') || 0));
const trainerProfiles = {
  'trail-kellan': { title: 'Young Trainer', art: 'young-trainer-large-art-v1.png' },
  'trail-nora': { title: 'Field Researcher', art: 'field-researcher-large-art-v1.png' },
};
const trainerProfile = trainerProfiles[trainerId] ?? { title: 'Young Trainer', art: 'young-trainer-large-art-v1.png' };
const playerAvatar = {
  body: playerProfile?.avatar?.body === 'female' ? 'female' : 'male',
  hair: ['auburn', 'brown', 'black', 'blonde'].includes(playerProfile?.avatar?.hair) ? playerProfile.avatar.hair : 'auburn',
};
const savedParty = wildBattle || trainerBattle ? JSON.parse(gameStorage.getItem('rorymon-party') || 'null') : null;
const battle = new Battle({ playerLevel: progression.level, highLevel, totammpolLead: query.get('lead') === 'totammpol', wild: wildBattle, wildSpecies: query.get('species'), wildLevel: query.get('wildLevel'), playerRoster: savedParty, trainerName });
const battleMusic = new BattleMusic();
let musicEnabled = true;
let highQuality = gameStorage.getItem('rorymon-art-quality') === 'high';
const storedBalls = gameStorage.getItem('rorymon-roryballs');
const ballInventory = {
  standard: storedBalls === null ? 5 : Math.max(0, Number(storedBalls)),
  ultra: Math.max(0, Number(gameStorage.getItem('rorymon-ultraroryballs') || 0)),
  quick: Math.max(0, Number(gameStorage.getItem('rorymon-quickroryballs') || 0)),
};
if (ballInventory.standard === 0 && gameStorage.getItem('rorymon-testing-refill') !== '1') {
  ballInventory.standard = 10;
  gameStorage.setItem('rorymon-roryballs', '10');
  gameStorage.setItem('rorymon-testing-refill', '1');
}
const $ = (selector) => document.querySelector(selector);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const moveSounds = Object.fromEntries(Object.entries({
  tackle: '../../assets/audio/moves/tackle.mp3',
  leaf_peck: '../../assets/audio/moves/leaf-peck.mp3',
  growl: '../../assets/audio/moves/growl.mp3',
  growth: '../../assets/audio/moves/growth.mp3',
  bough_rush: '../../assets/audio/moves/bough-rush.mp3',
  canopy_crash: '../../assets/audio/moves/tackle.mp3',
  frost_paw: '../../assets/audio/moves/leaf-peck.mp3',
  snow_guard: '../../assets/audio/moves/growth.mp3',
  wing_gust: '../../assets/audio/moves/leaf-peck.mp3',
  sky_dive: '../../assets/audio/moves/leaf-peck.mp3',
  ice_fang: '../../assets/audio/moves/tackle.mp3',
  blizzard: '../../assets/audio/moves/leaf-peck.mp3',
  antler_rush: '../../assets/audio/moves/tackle.mp3',
  leaf_storm: '../../assets/audio/moves/bough-rush.mp3',
  stone_horn: '../../assets/audio/moves/tackle.mp3',
  rock_throw: '../../assets/audio/moves/tackle.mp3',
  jade_guard: '../../assets/audio/moves/growth.mp3',
  ironbark: '../../assets/audio/moves/growth.mp3',
  sandstorm: '../../assets/audio/moves/growth.mp3',
  hail: '../../assets/audio/moves/growth.mp3',
  snow: '../../assets/audio/moves/growth.mp3',
  strong_winds: '../../assets/audio/moves/growth.mp3',
}).map(([move, source]) => {
  const audio = new Audio(source);
  audio.preload = 'auto';
  audio.volume = 0.65;
  return [move, audio];
}));
const els = {
  player: $('#player-sprite'), opponent: $('#opponent-sprite'),
  playerHp: $('#player-hp'), opponentHp: $('#opponent-hp'),
  playerHpText: $('#player-hp-text'), opponentHpText: $('#opponent-hp-text'),
  playerName: $('#player-name'), opponentName: $('#opponent-name'),
  opponentLevel: $('#opponent-level'), playerTeam: $('#player-team'), opponentTeam: $('#opponent-team'),
  log: $('#battle-log'), moves: $('#move-grid'), prompt: $('#battle-prompt'),
  restart: $('#restart'), turn: $('#turn-number'),
  intro: $('#battle-intro'), introSpeaker: $('#intro-speaker'),
  introText: $('#intro-text'), introProgress: $('#intro-progress'),
  introNext: $('#intro-next'), introSkip: $('#intro-skip'),
  arena: $('#battle-arena'), panel: $('#battle-panel'),
  playerLevel: $('#player-level'), playerExp: $('#player-exp'),
  playerExpText: $('#player-exp-text'), expSummary: $('#exp-summary'),
  expTitle: $('#exp-title'), levelMessage: $('#level-message'),
  musicToggle: $('#music-toggle'),
  qualityToggle: $('#quality-toggle'),
  switchOpen: $('#switch-open'),
  throwActions: $('#throw-actions'), throwOpen: $('#throw-open'), ballChoices: $('#ball-choices'),
  catchRorymon: $('#catch-rorymon'),
  catchUltra: $('#catch-ultra'), catchQuick: $('#catch-quick'),
  runAway: $('#run-away'),
  captureBall: $('#capture-ball'), captureStars: $('#capture-stars'),
  returnOverworld: $('#return-overworld'),
  challengerArt: $('#challenger-art'), challengerClass: $('#challenger-class'), challengerName: $('#challenger-name'),
  playerTrainerArt: $('#player-trainer-art'), playerTrainerName: $('#player-trainer-name'),
};

els.challengerArt.src = `../../assets/characters/artwork/npcs/${trainerProfile.art}`;
els.challengerArt.alt = `${trainerProfile.title} ${trainerName}`;
els.challengerClass.textContent = trainerProfile.title.toUpperCase();
els.challengerName.textContent = trainerName;
els.playerTrainerArt.src = `../../assets/characters/artwork/players/${playerAvatar.body}-trainer-large-art-hair-${playerAvatar.hair}-v1.png`;
els.playerTrainerArt.alt = `${playerTrainerName}, ${playerAvatar.hair}-haired ${playerAvatar.body === 'female' ? 'girl' : 'boy'} trainer`;
els.playerTrainerName.textContent = playerTrainerName;

function applyQualitySetting() {
  els.arena.classList.toggle('high-quality', highQuality);
  els.qualityToggle.setAttribute('aria-pressed', String(highQuality));
  els.qualityToggle.textContent = highQuality ? '◆ High quality' : '▦ Pixel art';
}

const introScenes = [
  { speaker: trainerName, text: 'I brought a team of Rorymon from the trail. Want to see who came along?' },
  { speaker: '', text: `Trainer ${trainerName} challenges ${playerTrainerName}!` },
  { speaker: trainerName, text: 'Let\'s see how our Rorymon teams match up!' },
  { speaker: playerTrainerName, text: 'Everyone ready? Let\'s observe carefully!' },
];
let introIndex = 0;
let introFinished = false;
const expNeeded = (level) => level * 20;
const assemblyLabel = (battler) => battler.variant
  ? `${battler.variant.top[0].toUpperCase()}/${battler.variant.middle[0].toUpperCase()}/${battler.variant.bottom[0].toUpperCase()}`
  : '';

function saveProgression() {
  sessionStorage.setItem(progressKey, JSON.stringify(progression));
}

function savePartyState(state = battle.snapshot()) {
  if (!wildBattle && !trainerBattle) return;
  const party = state.parties.player.map((member) => ({
    id: member.id,
    name: member.name,
    level: member.level,
    variant: member.variant,
    hp: member.hp,
    status: member.status,
    moves: member.moves.map((move) => ({ id: move.id, pp: move.pp })),
  }));
  gameStorage.setItem('rorymon-party', JSON.stringify(party));
}

function awardTrainerCredits() {
  if (!trainerBattle || !trainerId || trainerReward <= 0) return;
  const defeated = JSON.parse(gameStorage.getItem('rorymon-defeated-trainers') || '[]');
  if (defeated.includes(trainerId)) return;
  defeated.push(trainerId);
  gameStorage.setItem('rorymon-defeated-trainers', JSON.stringify(defeated));
  const credits = Math.max(0, Number(gameStorage.getItem('rorymon-credits') || 0));
  gameStorage.setItem('rorymon-credits', String(credits + trainerReward));
  announce(`${trainerName} paid ${trainerReward} credits in prize money!`, true);
}

function renderProgression() {
  const needed = expNeeded(progression.level);
  els.playerLevel.textContent = `Lv. ${progression.level}`;
  els.playerExp.style.width = `${Math.min(100, (progression.exp / needed) * 100)}%`;
  els.playerExpText.textContent = `${progression.exp} / ${needed}`;
}

function hpClass(hp, maxHp) {
  const ratio = hp / maxHp;
  return ratio <= 0.2 ? 'critical' : ratio <= 0.5 ? 'warning' : '';
}

function statusSuffix(battler) {
  const major = battler.status ? ` ${STATUS_CONDITIONS[battler.status.id].short}` : '';
  return `${major}${battler.confusion ? ' ?' : ''}`;
}

function render(state) {
  const spritePath = (battler, view) => {
    const uploaded = highQuality
      ? (view === 'rear' ? battler.artworkHighRear : battler.artworkHighFront)
      : (view === 'rear' ? battler.artworkRear : battler.artworkFront);
    if (uploaded) return uploaded;
    const species = battler.spriteKey ?? battler.id;
    if (species === 'taigant' && view === 'front') return '../../assets/taigant-front-transparent.png';
    if (highQuality && species.startsWith('totammpol-')) {
      return `../../assets/${species}-battle-art-${view}-transparent.png?v=20261006b`;
    }
    if (highQuality && species === 'totammpol-moose-bear-goat') {
      return `../../assets/totammpol-moose-bear-goat-battle-art-${view === 'rear' ? 'rear' : 'front'}-transparent.png`;
    }
    if (highQuality && species === 'totammpol-eagle-bear-goat') {
      return view === 'rear'
        ? '../../assets/totammpol-eagle-bear-goat-battle-art-rear-transparent.png'
        : '../../assets/totammpol-eagle-bear-goat-battle-art-front-transparent.png?v=20261005k';
    }
    if (highQuality && ['mossmoose', 'jadekid', 'nephram'].includes(species)) {
      return `../../assets/${species}-battle-art-${view === 'rear' ? 'rear' : 'front'}-transparent.png`;
    }
    const path = `../../assets/${species}${view === 'rear' ? '-sprite-rear' : '-sprite-front'}-transparent.png`;
    if (species === 'totammpol-eagle-bear-goat' && view === 'rear') return '../../assets/totammpol-eagle-bear-goat-sprite-rear-aligned-transparent.png?v=20261005j';
    return species.startsWith('totammpol-') ? `${path}?v=20261005e` : path;
  };
  for (const side of ['player', 'opponent']) {
    const battler = state[side];
    const bar = side === 'player' ? els.playerHp : els.opponentHp;
    const text = side === 'player' ? els.playerHpText : els.opponentHpText;
    bar.style.width = `${(battler.hp / battler.maxHp) * 100}%`;
    bar.className = `hp-fill ${hpClass(battler.hp, battler.maxHp)}`;
    text.textContent = `${battler.hp} / ${battler.maxHp}`;
  }
  els.playerName.textContent = `${state.player.name}${statusSuffix(state.player)}`;
  els.opponentName.textContent = `${state.opponent.nickname}${statusSuffix(state.opponent)}`;
  els.opponentLevel.textContent = `Lv. ${state.opponent.level}`;
  const playerSrc = spritePath(state.player, 'rear');
  const opponentSrc = spritePath(state.opponent, 'front');
  if (els.player.getAttribute('src') !== playerSrc) els.player.src = playerSrc;
  if (els.opponent.getAttribute('src') !== opponentSrc) els.opponent.src = opponentSrc;
  els.player.classList.toggle('totammpol-sprite', state.player.id === 'totammpol');
  els.opponent.classList.toggle('totammpol-sprite', state.opponent.id === 'totammpol');
  els.player.alt = `Player's ${state.player.name}`;
  els.opponent.alt = state.opponent.nickname;
  for (const side of ['player', 'opponent']) {
    const holder = side === 'player' ? els.playerTeam : els.opponentTeam;
    holder.replaceChildren(...state.parties[side].map((member, index) => {
      const pip = document.createElement('span');
      pip.className = `team-pip ${member.hp <= 0 ? 'fainted' : ''} ${state.activeIndex[side] === index ? 'active' : ''}`;
      pip.title = `${member.name}${member.variant ? ` (${assemblyLabel(member)})` : ''}: ${member.hp <= 0 ? 'fainted' : `${member.hp}/${member.maxHp} HP`}`;
      pip.setAttribute('aria-label', pip.title);
      return pip;
    }));
  }
  els.turn.textContent = state.winner ? 'Battle complete' : `Turn ${state.turn}`;
  els.moves.replaceChildren(...state.player.moves.map((move) => {
    const button = document.createElement('button');
    button.className = `move ${move.type}`;
    button.dataset.move = move.id;
    button.disabled = Boolean(state.winner) || move.pp <= 0;
    button.innerHTML = `<span>${move.name}</span><small>${move.type.toUpperCase()} · PP ${move.pp}/${move.maxPp}</small>`;
    return button;
  }));
  els.restart.hidden = !state.winner;
  els.returnOverworld.hidden = !query.has('from') || !state.winner;
  els.switchOpen.hidden = Boolean(state.winner);
  els.switchOpen.disabled = Boolean(state.winner) || !state.parties.player.some((member, index) => member.hp > 0 && index !== state.activeIndex.player);
  const canUseBall = Object.values(ballInventory).some((count) => count > 0);
  els.throwActions.hidden = !wildBattle || Boolean(state.winner);
  els.throwOpen.disabled = !canUseBall || Boolean(state.winner);
  els.runAway.hidden = !wildBattle || Boolean(state.winner);
  for (const [type, button, label] of [['standard', els.catchRorymon, 'Roryball'], ['ultra', els.catchUltra, 'Ultraroryball'], ['quick', els.catchQuick, 'Quickroryball']]) {
    button.hidden = ballInventory[type] <= 0;
    button.disabled = Boolean(state.winner);
    button.textContent = `${label} (${ballInventory[type]})`;
  }
  if (!canUseBall || state.winner) closeThrowMenu();
  renderProgression();
}

function closeThrowMenu() {
  els.ballChoices.hidden = true;
  els.throwOpen.setAttribute('aria-expanded', 'false');
}

function toggleThrowMenu() {
  if (els.throwOpen.disabled) return;
  const willOpen = els.ballChoices.hidden;
  els.ballChoices.hidden = !willOpen;
  els.throwOpen.setAttribute('aria-expanded', String(willOpen));
}

function showSwitchMenu() {
  closeThrowMenu();
  const state = battle.snapshot();
  els.prompt.textContent = 'Choose a Rorymon.';
  const choices = state.parties.player.map((member, index) => {
    const button = document.createElement('button');
    button.className = 'move switch-choice';
    button.dataset.switch = String(index);
    button.disabled = member.hp <= 0 || index === state.activeIndex.player;
    button.innerHTML = `<span>${member.name}${member.variant ? ` · ${assemblyLabel(member)}` : ''}</span><small>Lv. ${member.level} · HP ${member.hp}/${member.maxHp}${index === state.activeIndex.player ? ' · ACTIVE' : member.hp <= 0 ? ' · FAINTED' : ''}</small>`;
    return button;
  });
  const cancel = document.createElement('button');
  cancel.className = 'move cancel-switch';
  cancel.dataset.cancelSwitch = 'true';
  cancel.innerHTML = '<span>Cancel</span><small>Return to moves</small>';
  els.moves.replaceChildren(...choices, cancel);
}

function announce(text, append = false) {
  els.log.textContent = append ? `${els.log.textContent}\n${text}` : text;
  els.log.scrollTop = els.log.scrollHeight;
}

function openingText(state = battle.snapshot()) {
  const assembly = state.opponent.variant ? ` (${state.opponent.variant.top}/${state.opponent.variant.middle}/${state.opponent.variant.bottom})` : '';
  if (wildBattle) return `${state.opponent.nickname} appeared!\nGo, ${state.player.name}!`;
  return highLevel
    ? `Level 30 exhibition battle!\n${trainerName} sent out ${state.opponent.name}${assembly}!\nGo, ${state.player.name}!`
    : `${trainerName} sent out ${state.opponent.name}!\nGo, ${state.player.name}!${trainerBattle ? '' : `\n${trainerName} is testing the eagle–bear–goat Totammpöl assembly.`}`;
}

function playMoveSound(moveId) {
  for (const audio of Object.values(moveSounds)) {
    audio.pause();
    audio.currentTime = 0;
  }
  moveSounds[moveId]?.play().catch(() => {});
}

function renderIntro() {
  const scene = introScenes[introIndex];
  els.introSpeaker.textContent = scene.speaker;
  els.introSpeaker.hidden = !scene.speaker;
  els.introText.textContent = scene.text;
  els.introProgress.textContent = `${introIndex + 1} / ${introScenes.length}`;
  els.introNext.firstChild.textContent = introIndex === introScenes.length - 1 ? 'Battle! ' : 'Continue ';
}

function beginBattle() {
  if (introFinished) return;
  introFinished = true;
  els.intro.classList.add('intro-exit');
  els.arena.classList.remove('awaiting-battle');
  els.panel.classList.remove('awaiting-battle');
  els.arena.setAttribute('aria-hidden', 'false');
  els.panel.setAttribute('aria-hidden', 'false');
  announce(openingText());
  els.prompt.textContent = `What will ${battle.player.name} do?`;
  if (musicEnabled) battleMusic.start();
  setTimeout(() => {
    els.intro.hidden = true;
    els.arena.classList.add('battle-enter');
    els.panel.classList.add('battle-enter');
    document.querySelector('.move:not(:disabled)')?.focus();
  }, 430);
}

function advanceIntro() {
  if (introFinished) return;
  if (introIndex < introScenes.length - 1) {
    introIndex += 1;
    els.intro.classList.remove('dialogue-pop');
    void els.intro.offsetWidth;
    els.intro.classList.add('dialogue-pop');
    renderIntro();
  } else {
    beginBattle();
  }
}

async function animateEvent(event) {
  if (event.type === 'turn') return;
  announce(event.text, true);
  if (event.type === 'result') battleMusic.stop();
  if (event.type === 'move') {
    playMoveSound(event.move);
    const sprite = event.actor === 'player' ? els.player : els.opponent;
    sprite.classList.add(event.actor === 'player' ? 'lunge-right' : 'lunge-left');
    await delay(330);
    sprite.classList.remove('lunge-right', 'lunge-left');
  }
  if (event.type === 'damage') {
    const sprite = event.target === 'player' ? els.player : els.opponent;
    sprite.classList.add('hit');
    const bar = event.target === 'player' ? els.playerHp : els.opponentHp;
    const text = event.target === 'player' ? els.playerHpText : els.opponentHpText;
    bar.style.width = `${(event.hp / event.maxHp) * 100}%`;
    bar.className = `hp-fill ${hpClass(event.hp, event.maxHp)}`;
    text.textContent = `${event.hp} / ${event.maxHp}`;
    await delay(440);
    sprite.classList.remove('hit');
  } else if (event.type === 'capture-throw') {
    els.captureBall.hidden = false;
    els.captureBall.className = 'capture-ball throwing';
    await delay(720);
    els.captureBall.className = 'capture-ball impact';
    els.opponent.classList.add('capture-absorb');
    await delay(650);
    els.captureBall.className = 'capture-ball dropping';
    await delay(280);
    els.captureBall.className = 'capture-ball resting';
  } else if (event.type === 'captured') {
    els.captureBall.classList.add('shaking');
    await delay(1250);
    els.captureBall.className = 'capture-ball resting success';
    els.captureStars.hidden = false;
    await delay(780);
    els.captureStars.hidden = true;
    els.captureBall.hidden = true;
    els.captureBall.className = 'capture-ball';
  } else if (event.type === 'capture-break') {
    els.captureBall.classList.add('shaking');
    await delay(860);
    els.captureBall.className = 'capture-ball resting breaking';
    els.opponent.classList.remove('capture-absorb');
    els.opponent.classList.add('capture-escaped');
    await delay(520);
    els.captureBall.hidden = true;
    els.captureBall.className = 'capture-ball';
    els.opponent.classList.remove('capture-escaped');
  } else if (event.type === 'faint') {
    const sprite = event.target === 'player' ? els.player : els.opponent;
    sprite.classList.add('faint');
    await delay(600);
  } else if (event.type === 'switch') {
    render(battle.snapshot());
    const sprite = event.target === 'player' ? els.player : els.opponent;
    sprite.classList.remove('faint');
    sprite.classList.add('send-out');
    await delay(650);
    sprite.classList.remove('send-out');
  } else {
    await delay(event.type === 'result' ? 650 : 420);
  }
}

async function awardExperience() {
  const gained = 65;
  let remaining = gained;
  const levelsGained = [];
  els.restart.hidden = true;
  els.expSummary.hidden = false;
  els.expSummary.classList.add('show');
  const teamNames = battle.parties.player.map((member) => member.name).join(', ');
  els.expTitle.textContent = `Your team gained ${gained} EXP!`;
  els.levelMessage.textContent = '';
  announce(`${teamNames} gained ${gained} experience points!`, true);
  await delay(400);

  while (remaining > 0) {
    const needed = expNeeded(progression.level);
    const step = Math.min(remaining, needed - progression.exp);
    progression.exp += step;
    remaining -= step;
    renderProgression();
    await delay(850);
    if (progression.exp >= needed) {
      progression.level += 1;
      progression.exp = 0;
      levelsGained.push(progression.level);
      renderProgression();
      els.levelMessage.textContent = `Team level up! All three reached Lv. ${progression.level}.`;
      announce(`${teamNames} grew to level ${progression.level}!`, true);
      els.player.classList.add('level-up');
      await delay(900);
      els.player.classList.remove('level-up');
    }
  }

  saveProgression();
  if ((wildBattle || trainerBattle) && levelsGained.length) {
    const savedRoster = JSON.parse(gameStorage.getItem('rorymon-party') || '[]');
    const leveledRoster = savedRoster.map((member) => {
      const oldLevel = member.level ?? progression.level;
      const gainedLevels = Math.max(0, progression.level - oldLevel);
      return { ...member, level: progression.level, hp: Number.isFinite(Number(member.hp)) ? Number(member.hp) + gainedLevels * 3 : member.hp };
    });
    gameStorage.setItem('rorymon-party', JSON.stringify(leveledRoster));
  }
  battle.setPlayerLevel(progression.level);
  els.restart.hidden = false;
  els.restart.textContent = levelsGained.length ? 'Battle again at the new level' : 'Battle again';
}

async function takeTurn(moveId) {
  closeThrowMenu();
  els.moves.classList.add('locked');
  els.switchOpen.disabled = true;
  document.querySelectorAll('.move').forEach((button) => { button.disabled = true; });
  announce('');
  const result = battle.resolveTurn(moveId);
  for (const event of result.events) await animateEvent(event);
  savePartyState(result.state);
  render(result.state);
  els.prompt.textContent = result.state.winner ? (result.state.winner === 'player' ? 'Victory!' : 'Defeat!') : `What will ${result.state.player.name} do?`;
  if (result.state.winner === 'player' && !highLevel) await awardExperience();
  if (result.state.winner === 'player') awardTrainerCredits();
  els.moves.classList.remove('locked');
}

async function takeSwitch(targetIndex) {
  closeThrowMenu();
  els.moves.classList.add('locked');
  els.switchOpen.disabled = true;
  announce('');
  const result = battle.resolveSwitch(targetIndex);
  for (const event of result.events) await animateEvent(event);
  savePartyState(result.state);
  render(result.state);
  els.prompt.textContent = result.state.winner ? 'Defeat!' : `What will ${result.state.player.name} do?`;
  els.moves.classList.remove('locked');
}

async function takeCapture(ballType = 'standard') {
  if (!wildBattle || ballInventory[ballType] <= 0) return;
  closeThrowMenu();
  ballInventory[ballType] -= 1;
  const storageKey = ballType === 'ultra' ? 'rorymon-ultraroryballs' : ballType === 'quick' ? 'rorymon-quickroryballs' : 'rorymon-roryballs';
  gameStorage.setItem(storageKey, String(ballInventory[ballType]));
  els.moves.classList.add('locked');
  els.switchOpen.disabled = true;
  els.catchRorymon.disabled = true;
  els.catchUltra.disabled = true;
  els.catchQuick.disabled = true;
  els.captureBall.dataset.ball = ballType;
  document.querySelectorAll('.move').forEach((button) => { button.disabled = true; });
  announce('');
  const result = battle.attemptCapture(ballType);
  for (const event of result.events) await animateEvent(event);
  if (result.state.captured) {
    const collection = JSON.parse(gameStorage.getItem('rorymon-collection') || '[]');
    collection.push({ ...result.state.captured, caughtAt: new Date().toISOString() });
    gameStorage.setItem('rorymon-collection', JSON.stringify(collection));
    if (!result.state.captured.addedToParty) {
      const storage = JSON.parse(gameStorage.getItem('rorymon-storage') || '[]');
      const caught = result.state.opponent;
      storage.push({
        ...result.state.captured,
        hp: caught.hp,
        status: caught.status,
        moves: caught.moves.map((move) => ({ id: move.id, pp: move.pp })),
        storedAt: new Date().toISOString(),
      });
      gameStorage.setItem('rorymon-storage', JSON.stringify(storage));
    }
  }
  savePartyState(result.state);
  render(result.state);
  els.prompt.textContent = result.state.captured
    ? (result.state.captured.addedToParty
      ? `${result.state.captured.name} joined your party!`
      : `${result.state.captured.name} was sent to your storage box.`)
    : `What will ${result.state.player.name} do?`;
  els.moves.classList.remove('locked');
}

els.moves.addEventListener('click', (event) => {
  const button = event.target.closest('[data-move]');
  if (button && !button.disabled) takeTurn(button.dataset.move);
  const switchButton = event.target.closest('[data-switch]');
  if (switchButton && !switchButton.disabled) takeSwitch(Number(switchButton.dataset.switch));
  if (event.target.closest('[data-cancel-switch]')) {
    render(battle.snapshot());
    els.prompt.textContent = `What will ${battle.player.name} do?`;
  }
});

els.switchOpen.addEventListener('click', showSwitchMenu);
els.throwOpen.addEventListener('click', toggleThrowMenu);
els.catchRorymon.addEventListener('click', () => takeCapture('standard'));
els.catchUltra.addEventListener('click', () => takeCapture('ultra'));
els.catchQuick.addEventListener('click', () => takeCapture('quick'));
els.runAway.addEventListener('click', () => {
  if (!wildBattle || battle.snapshot().winner) return;
  closeThrowMenu();
  savePartyState();
  window.location.href = '../overworld/index.html';
});
if (query.has('from')) {
  els.returnOverworld.addEventListener('click', () => { window.location.href = '../overworld/index.html'; });
}

els.restart.addEventListener('click', () => {
  const state = battle.reset();
  els.player.className = 'combatant player-sprite';
  els.opponent.className = 'combatant opponent-sprite';
  els.captureBall.hidden = true;
  els.captureStars.hidden = true;
  els.prompt.textContent = `What will ${state.player.name} do?`;
  els.expSummary.hidden = true;
  els.expSummary.classList.remove('show');
  els.restart.textContent = 'Battle again';
  announce(openingText(state));
  if (musicEnabled) battleMusic.start();
  render(state);
});

els.musicToggle.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  els.musicToggle.setAttribute('aria-pressed', String(musicEnabled));
  els.musicToggle.textContent = musicEnabled ? '♫ Music on' : '♫ Music off';
  if (musicEnabled && !battle.winner) battleMusic.start();
  else battleMusic.stop();
});

els.qualityToggle.addEventListener('click', () => {
  highQuality = !highQuality;
  gameStorage.setItem('rorymon-art-quality', highQuality ? 'high' : 'pixel');
  applyQualitySetting();
  render(battle.snapshot());
});

els.introNext.addEventListener('click', advanceIntro);
els.introSkip.addEventListener('click', beginBattle);
document.addEventListener('keydown', (event) => {
  if (!introFinished && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    advanceIntro();
  }
});

renderIntro();
applyQualitySetting();
announce(openingText());
render(battle.snapshot());
if (wildBattle) beginBattle();
