export const MOVES = Object.freeze({
  tackle: { id: 'tackle', name: 'Tackle', type: 'normal', kind: 'damage', power: 48, accuracy: 100, maxPp: 35 },
  leaf_peck: { id: 'leaf_peck', name: 'Leaf Peck', type: 'grass', kind: 'damage', power: 40, accuracy: 100, maxPp: 30 },
  growl: { id: 'growl', name: 'Growl', type: 'normal', kind: 'status', accuracy: 100, maxPp: 40, stat: 'attack', stages: -1, target: 'opponent' },
  growth: { id: 'growth', name: 'Growth', type: 'normal', kind: 'status', accuracy: 100, maxPp: 20, stat: 'attack', stages: 1, target: 'self' },
  bough_rush: { id: 'bough_rush', name: 'Bough Rush', type: 'grass', kind: 'damage', power: 65, accuracy: 100, maxPp: 20, effect: { kind: 'stage', chance: 0.3, stat: 'speed', stages: 1, target: 'self' } },
  canopy_crash: { id: 'canopy_crash', name: 'Canopy Crash', type: 'grass', kind: 'damage', power: 90, accuracy: 100, maxPp: 10, effect: { kind: 'stage', chance: 1, stat: 'speed', stages: -1, target: 'self' } },
  frost_paw: { id: 'frost_paw', name: 'Frost Paw', type: 'ice', kind: 'damage', power: 40, accuracy: 100, maxPp: 30, effect: { kind: 'status', chance: 0.1, status: 'frozen', target: 'opponent' } },
  snow_guard: { id: 'snow_guard', name: 'Snow Guard', type: 'ice', kind: 'status', accuracy: 100, maxPp: 20, stat: 'defense', stages: 1, target: 'self' },
  wing_gust: { id: 'wing_gust', name: 'Wing Gust', type: 'flying', kind: 'damage', power: 45, accuracy: 100, maxPp: 25 },
  sky_dive: { id: 'sky_dive', name: 'Sky Dive', type: 'flying', kind: 'damage', power: 90, accuracy: 95, maxPp: 10 },
  ice_fang: { id: 'ice_fang', name: 'Ice Fang', type: 'ice', kind: 'damage', power: 70, accuracy: 95, maxPp: 15, effect: { kind: 'status', chance: 0.1, status: 'frozen', target: 'opponent' } },
  blizzard: { id: 'blizzard', name: 'Blizzard', type: 'ice', kind: 'damage', power: 110, accuracy: 70, maxPp: 5, effect: { kind: 'status', chance: 0.1, status: 'frozen', target: 'opponent' } },
  antler_rush: { id: 'antler_rush', name: 'Antler Rush', type: 'grass', kind: 'damage', power: 85, accuracy: 95, maxPp: 15 },
  leaf_storm: { id: 'leaf_storm', name: 'Leaf Storm', type: 'grass', kind: 'damage', power: 110, accuracy: 90, maxPp: 5 },
  rock_throw: { id: 'rock_throw', name: 'Rock Throw', type: 'rock', kind: 'damage', power: 50, accuracy: 90, maxPp: 15 },
  jade_guard: { id: 'jade_guard', name: 'Jade Guard', type: 'rock', kind: 'status', accuracy: 100, maxPp: 20, stat: 'defense', stages: 1, target: 'self' },
  stone_horn: { id: 'stone_horn', name: 'Stone Horn', type: 'rock', kind: 'damage', power: 90, accuracy: 90, maxPp: 10 },
  ironbark: { id: 'ironbark', name: 'Ironbark', type: 'grass', kind: 'status', accuracy: 100, maxPp: 15, stat: 'defense', stages: 2, target: 'self' },
  sandstorm: { id: 'sandstorm', name: 'Sandstorm', type: 'rock', kind: 'weather', accuracy: 100, maxPp: 10, weather: 'sandstorm' },
  hail: { id: 'hail', name: 'Hail', type: 'ice', kind: 'weather', accuracy: 100, maxPp: 10, weather: 'hail' },
  snow: { id: 'snow', name: 'Snow', type: 'ice', kind: 'weather', accuracy: 100, maxPp: 10, weather: 'snow' },
  strong_winds: { id: 'strong_winds', name: 'Strong Winds', type: 'flying', kind: 'weather', accuracy: 100, maxPp: 10, weather: 'strong_winds' },
});

export const TOTAMMPOL_ANIMALS = Object.freeze({
  eagle: Object.freeze({ type: 'flying', moves: ['wing_gust', 'sky_dive'], weather: 'sandstorm' }),
  bear: Object.freeze({ type: 'ice', moves: ['frost_paw', 'blizzard'], weather: 'strong_winds' }),
  moose: Object.freeze({ type: 'grass', moves: ['leaf_peck', 'antler_rush'], weather: 'snow' }),
  goat: Object.freeze({ type: 'rock', moves: ['rock_throw', 'stone_horn'], weather: 'hail' }),
});

export const TOTAMMPOL_VARIANTS = Object.freeze(Object.keys(TOTAMMPOL_ANIMALS).flatMap((top) =>
  Object.keys(TOTAMMPOL_ANIMALS).flatMap((middle) =>
    top === middle ? [] : Object.keys(TOTAMMPOL_ANIMALS)
      .filter((bottom) => bottom !== top && bottom !== middle)
      .map((bottom) => Object.freeze({ top, middle, bottom, key: `${top}-${middle}-${bottom}` })),
  ),
));

export const DEMO_SPECIES = Object.freeze({
  mossmoose: Object.freeze({ id: 'mossmoose', name: 'Mossmoose', type: 'grass', level: 5, maxHp: 44, attack: 25, defense: 23, speed: 18, catchRate: 0.46 }),
  branchler: Object.freeze({ id: 'branchler', name: 'Branchler', type: 'grass', level: 5, maxHp: 49, attack: 29, defense: 26, speed: 22, catchRate: 0.34 }),
  taigant: Object.freeze({ id: 'taigant', name: 'Taigant', type: 'grass', level: 5, maxHp: 58, attack: 34, defense: 31, speed: 16, catchRate: 0.2 }),
  cubice: Object.freeze({ id: 'cubice', name: 'Cubice', type: 'ice', level: 5, maxHp: 46, attack: 26, defense: 27, speed: 20, catchRate: 0.4 }),
  icebearg: Object.freeze({ id: 'icebearg', name: 'Icebearg', type: 'ice', level: 16, maxHp: 72, attack: 44, defense: 55, speed: 28, catchRate: 0.24, spriteKey: 'icebearg', moves: ['frost_paw', 'ice_fang', 'snow_guard', 'growl'] }),
  glaciursus: Object.freeze({ id: 'glaciursus', name: 'Glaciursus', type: 'ice', level: 32, maxHp: 118, attack: 68, defense: 92, speed: 25, catchRate: 0.1, spriteKey: 'glaciursus', moves: ['ice_fang', 'blizzard', 'snow_guard', 'hail'] }),
  jadekid: Object.freeze({ id: 'jadekid', name: 'Jadekid', type: 'rock', level: 5, maxHp: 47, attack: 27, defense: 31, speed: 19, catchRate: 0.38 }),
  nephram: Object.freeze({ id: 'nephram', name: 'Nephram', type: 'rock', level: 12, maxHp: 68, attack: 42, defense: 48, speed: 24, catchRate: 0.2 }),
  totammpol: Object.freeze({ id: 'totammpol', name: 'Totammpöl', type: 'flying', secondaryType: 'ice', level: 5, maxHp: 52, attack: 27, defense: 30, speed: 17, catchRate: 0.12 }),
});

export const EDITOR_STORAGE_KEY = 'rorymon-content-editor';

function readEditorContent() {
  try {
    if (typeof localStorage === 'undefined') return { moves: {}, species: {} };
    const saved = JSON.parse(localStorage.getItem(EDITOR_STORAGE_KEY) || '{}');
    return {
      moves: saved.moves && typeof saved.moves === 'object' ? saved.moves : {},
      species: saved.species && typeof saved.species === 'object' ? saved.species : {},
    };
  } catch {
    return { moves: {}, species: {} };
  }
}

export function getMoveCatalog() {
  return { ...MOVES, ...readEditorContent().moves };
}

export function getSpeciesCatalog() {
  return { ...DEMO_SPECIES, ...readEditorContent().species };
}

export const STATUS_CONDITIONS = Object.freeze({
  burn: { id: 'burn', name: 'Burn', short: 'BRN' },
  frozen: { id: 'frozen', name: 'Frozen', short: 'FRZ' },
  paralysis: { id: 'paralysis', name: 'Paralysis', short: 'PAR' },
  poison: { id: 'poison', name: 'Poison', short: 'PSN' },
  toxic: { id: 'toxic', name: 'Badly Poisoned', short: 'TOX' },
  sleep: { id: 'sleep', name: 'Sleep', short: 'SLP' },
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const hasType = (battler, type) => battler.type === type || battler.secondaryType === type;
const typeEffectiveness = (moveType, defender, weather = null) => {
  const types = typeof defender === 'string' ? [defender] : [defender.type, defender.secondaryType].filter(Boolean);
  const against = (defenderType) => {
    if (weather?.id === 'strong_winds' && defenderType === 'flying' && ['ice', 'rock', 'electric'].includes(moveType)) return 1;
    if (moveType === 'grass' && defenderType === 'grass') return 0.5;
    if (moveType === 'ice' && ['grass', 'flying'].includes(defenderType)) return 2;
    if (moveType === 'ice' && defenderType === 'ice') return 0.5;
    if (moveType === 'rock' && defenderType === 'flying') return 2;
    if (moveType === 'flying' && defenderType === 'grass') return 2;
    return 1;
  };
  return types.reduce((total, type) => total * against(type), 1);
};

export function stageMultiplier(stage) {
  const safeStage = clamp(stage, -6, 6);
  return safeStage >= 0 ? (2 + safeStage) / 2 : 2 / (2 - safeStage);
}

export function applyStatus(battler, statusId, rng = Math.random) {
  if (!STATUS_CONDITIONS[statusId] || battler.status) return false;
  if (statusId === 'frozen' && hasType(battler, 'ice')) return false;
  battler.status = {
    id: statusId,
    turns: statusId === 'sleep' ? 1 + Math.floor(rng() * 3) : null,
    counter: statusId === 'toxic' ? 1 : null,
  };
  return true;
}

export function applyConfusion(battler, rng = Math.random) {
  if (battler.confusion) return false;
  battler.confusion = { turns: 1 + Math.floor(rng() * 4) };
  return true;
}

export function createBattler(side, nickname = 'Mossmoose', level = 5, speciesId = 'mossmoose', variant = null) {
  const speciesCatalog = getSpeciesCatalog();
  const moveCatalog = getMoveCatalog();
  let species = speciesCatalog[speciesId] ?? speciesCatalog.mossmoose;
  if (speciesId === 'totammpol' && variant) {
    species = { ...species, type: TOTAMMPOL_ANIMALS[variant.top].type, secondaryType: TOTAMMPOL_ANIMALS[variant.middle].type };
  }
  const levelGain = Math.max(0, level - species.level);
  const highLevel = level >= 30;
  const builtInMoveIds = speciesId === 'totammpol' && variant && level >= 24
    ? [TOTAMMPOL_ANIMALS[variant.top].moves[0], TOTAMMPOL_ANIMALS[variant.top].moves[1], TOTAMMPOL_ANIMALS[variant.middle].moves[1], TOTAMMPOL_ANIMALS[variant.bottom].weather]
    : speciesId === 'totammpol' && variant && level >= 16
      ? ['tackle', TOTAMMPOL_ANIMALS[variant.top].moves[0], TOTAMMPOL_ANIMALS[variant.top].moves[1], TOTAMMPOL_ANIMALS[variant.middle].moves[0]]
      : speciesId === 'totammpol' && variant
        ? ['tackle', 'growl', 'growth', TOTAMMPOL_ANIMALS[variant.top].moves[0]]
    : highLevel && speciesId === 'mossmoose'
      ? ['leaf_peck', 'antler_rush', 'ironbark', 'growth']
      : highLevel && speciesId === 'branchler'
        ? ['bough_rush', 'leaf_storm', 'growl', 'growth']
        : highLevel && speciesId === 'taigant'
          ? ['canopy_crash', 'leaf_storm', 'ironbark', 'tackle']
          : highLevel && speciesId === 'cubice'
            ? ['frost_paw', 'ice_fang', 'blizzard', 'snow_guard']
    : speciesId === 'branchler'
    ? ['tackle', 'leaf_peck', 'growl', 'bough_rush']
    : speciesId === 'taigant'
      ? ['tackle', 'leaf_peck', 'growl', 'canopy_crash']
      : speciesId === 'cubice'
        ? ['tackle', 'growl', 'frost_paw', 'snow_guard']
        : speciesId === 'jadekid'
          ? ['tackle', 'rock_throw', 'growl', 'jade_guard']
          : speciesId === 'nephram'
            ? ['tackle', 'rock_throw', 'stone_horn', 'jade_guard']
        : speciesId === 'totammpol'
          ? ['tackle', 'growl', 'growth', 'wing_gust']
      : ['tackle', 'leaf_peck', 'growl', 'growth'];
  const moveIds = highLevel && Array.isArray(species.highLevelMoves) && species.highLevelMoves.length
    ? species.highLevelMoves
    : Array.isArray(species.moves) && species.moves.length ? species.moves : builtInMoveIds;
  const variantArtwork = variant ? species.variantArtwork?.[variant.key] : null;
  return {
    side,
    nickname,
    ...species,
    level,
    maxHp: species.maxHp + levelGain * 3,
    attack: species.attack + levelGain * 2,
    defense: species.defense + levelGain * 2,
    speed: species.speed + levelGain,
    hp: species.maxHp + levelGain * 3,
    stages: { attack: 0, defense: 0, speed: 0 },
    status: null,
    confusion: null,
    variant,
    spriteKey: variant ? `totammpol-${variant.key}` : (species.spriteKey || speciesId),
    artworkFront: variantArtwork?.front ?? species.artworkFront,
    artworkRear: variantArtwork?.rear ?? species.artworkRear,
    artworkHighFront: variantArtwork?.highFront ?? species.artworkHighFront,
    artworkHighRear: variantArtwork?.highRear ?? species.artworkHighRear,
    moves: moveIds.filter((moveId) => moveCatalog[moveId]).slice(0, 4).map((moveId) => ({ ...moveCatalog[moveId], pp: moveCatalog[moveId].maxPp })),
  };
}

export function calculateDamage(attacker, defender, move, rng = Math.random, weather = null) {
  const burnPenalty = attacker.status?.id === 'burn' && move.kind === 'damage' ? 0.5 : 1;
  const attack = attacker.attack * stageMultiplier(attacker.stages.attack) * burnPenalty;
  const weatherDefense = weather?.id === 'snow' && hasType(defender, 'ice') ? 1.5
    : weather?.id === 'sandstorm' && hasType(defender, 'rock') ? 1.5 : 1;
  const defense = defender.defense * stageMultiplier(defender.stages.defense) * weatherDefense;
  const base = (((2 * attacker.level) / 5 + 2) * move.power * attack) / defense / 50 + 2;
  const stab = hasType(attacker, move.type) ? 1.5 : 1;
  const effectiveness = typeEffectiveness(move.type, defender, weather);
  const variance = 0.9 + rng() * 0.1;
  return Math.max(1, Math.floor(base * stab * effectiveness * variance));
}

export class Battle {
  constructor({ rng = Math.random, playerLevel = 5, highLevel = false, totammpolLead = false, wild = false, wildSpecies = null, wildLevel = null, playerRoster = null, trainerName = 'Kellan' } = {}) {
    this.rng = rng;
    this.playerLevel = playerLevel;
    this.highLevel = highLevel;
    this.totammpolLead = totammpolLead;
    this.wild = wild;
    this.speciesCatalog = getSpeciesCatalog();
    this.wildSpecies = this.speciesCatalog[wildSpecies] ? wildSpecies : null;
    this.wildLevel = Number.isFinite(Number(wildLevel)) ? Math.max(1, Math.min(100, Number(wildLevel))) : null;
    this.playerRoster = playerRoster;
    this.trainerName = trainerName;
    this.reset();
  }

  setPlayerLevel(level) {
    this.playerLevel = level;
  }

  reset() {
    const shuffle = (entries) => {
      const species = [...entries];
      for (let index = species.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(this.rng() * (index + 1));
        [species[index], species[swap]] = [species[swap], species[index]];
      }
      return species;
    };
    const chooseBaseParty = () => shuffle(['mossmoose', 'branchler', 'taigant', 'cubice']).slice(0, 3);
    const playerSpecies = this.highLevel
      ? shuffle(['totammpol', ...chooseBaseParty().slice(0, 2)])
      : chooseBaseParty();
    const opponentSpecies = this.wild
      ? [this.wildSpecies ?? chooseBaseParty()[0]]
      : this.highLevel
      ? shuffle(['totammpol', ...chooseBaseParty().slice(0, 2)])
      : ['totammpol', ...chooseBaseParty().slice(0, 2)];
    if (this.totammpolLead && this.highLevel) {
      playerSpecies.splice(0, playerSpecies.length, 'totammpol', ...playerSpecies.filter((id) => id !== 'totammpol'));
      opponentSpecies.splice(0, opponentSpecies.length, 'totammpol', ...opponentSpecies.filter((id) => id !== 'totammpol'));
    }
    const makeMember = (side, speciesId, level, savedVariant = null, savedState = null) => {
      const variant = savedVariant ?? (speciesId === 'totammpol'
        ? (this.highLevel || this.wild
          ? TOTAMMPOL_VARIANTS[Math.floor(this.rng() * TOTAMMPOL_VARIANTS.length)]
          : TOTAMMPOL_VARIANTS.find((item) => item.key === 'eagle-bear-goat'))
        : null);
      const name = side === 'opponent'
        ? (this.wild ? `Wild ${this.speciesCatalog[speciesId].name}` : `${this.trainerName}'s ${this.speciesCatalog[speciesId].name}`)
        : this.speciesCatalog[speciesId].name;
      const battler = createBattler(side, name, level, speciesId, variant);
      if (savedState) {
        if (Number.isFinite(Number(savedState.hp))) battler.hp = clamp(Number(savedState.hp), 0, battler.maxHp);
        battler.status = savedState.status ? structuredClone(savedState.status) : null;
        if (Array.isArray(savedState.moves)) {
          for (const move of battler.moves) {
            const savedMove = savedState.moves.find((candidate) => candidate.id === move.id);
            if (savedMove && Number.isFinite(Number(savedMove.pp))) {
              move.pp = clamp(Number(savedMove.pp), 0, move.maxPp);
            }
          }
        }
      }
      return battler;
    };
    const opponentLevel = this.highLevel ? 30 : (this.wildLevel ?? this.speciesCatalog[opponentSpecies[0]]?.level ?? 5);
    const savedParty = Array.isArray(this.playerRoster)
      ? this.playerRoster.filter((member) => this.speciesCatalog[member.id]).slice(0, 6)
      : [];
    this.parties = {
      player: savedParty.length
        ? savedParty.map((member) => makeMember('player', member.id, member.level ?? this.playerLevel, member.variant ?? null, member))
        : playerSpecies.map((speciesId) => makeMember('player', speciesId, this.highLevel ? 30 : this.playerLevel)),
      opponent: opponentSpecies.map((speciesId) => makeMember('opponent', speciesId, opponentLevel)),
    };
    const firstHealthyPlayer = this.parties.player.findIndex((member) => member.hp > 0);
    this.activeIndex = { player: firstHealthyPlayer >= 0 ? firstHealthyPlayer : 0, opponent: 0 };
    this.player = this.parties.player[this.activeIndex.player];
    this.opponent = this.parties.opponent[0];
    this.turn = 1;
    this.winner = null;
    this.weather = null;
    this.captured = null;
    return this.snapshot();
  }

  snapshot() {
    return structuredClone({ player: this.player, opponent: this.opponent, parties: this.parties, activeIndex: this.activeIndex, turn: this.turn, winner: this.winner, weather: this.weather, captured: this.captured });
  }

  sendNext(side) {
    const nextIndex = this.parties[side].findIndex((member, index) => index !== this.activeIndex[side] && member.hp > 0);
    if (nextIndex < 0) return null;
    this.activeIndex[side] = nextIndex;
    this[side] = this.parties[side][nextIndex];
    return this[side];
  }

  handleFaint(side, winnerSide, events) {
    const fainted = this[side];
    if (fainted.hp > 0) return;
    events.push({ type: 'faint', target: side, text: `${fainted.nickname} fainted!` });
    const replacement = this.sendNext(side);
    if (replacement) {
      events.push({ type: 'switch', target: side, species: replacement.id, text: side === 'player' ? `Go, ${replacement.name}!` : `${this.trainerName} sent out ${replacement.name}!` });
    } else {
      this.winner = winnerSide;
      events.push({ type: 'result', winner: winnerSide, text: winnerSide === 'player' ? `You defeated Trainer ${this.trainerName}!` : `${this.trainerName} won the battle!` });
    }
  }

  checkCanAct(actor, events) {
    const status = actor.status?.id;
    if (status === 'sleep') {
      if (actor.status.turns > 0) {
        actor.status.turns -= 1;
        events.push({ type: 'message', text: `${actor.nickname} is fast asleep.` });
        return false;
      }
      actor.status = null;
      events.push({ type: 'status', target: actor.side, text: `${actor.nickname} woke up!` });
    }
    if (status === 'frozen') {
      if (this.rng() >= 0.2) {
        events.push({ type: 'message', text: `${actor.nickname} is frozen solid!` });
        return false;
      }
      actor.status = null;
      events.push({ type: 'status', target: actor.side, text: `${actor.nickname} thawed out!` });
    }
    if (status === 'paralysis' && this.rng() < 0.25) {
      events.push({ type: 'message', text: `${actor.nickname} is paralyzed! It cannot move!` });
      return false;
    }
    if (actor.confusion) {
      if (actor.confusion.turns <= 0) {
        actor.confusion = null;
        events.push({ type: 'status', target: actor.side, text: `${actor.nickname} snapped out of confusion!` });
      } else {
        actor.confusion.turns -= 1;
        events.push({ type: 'message', text: `${actor.nickname} is confused!` });
        if (this.rng() < 1 / 3) {
          const attack = actor.attack * stageMultiplier(actor.stages.attack);
          const defense = actor.defense * stageMultiplier(actor.stages.defense);
          const damage = Math.max(1, Math.floor(((((2 * actor.level) / 5 + 2) * 40 * attack) / defense / 50 + 2) * (0.9 + this.rng() * 0.1)));
          actor.hp = Math.max(0, actor.hp - damage);
          events.push({ type: 'damage', target: actor.side, amount: damage, hp: actor.hp, maxHp: actor.maxHp, text: `${actor.nickname} hurt itself in confusion!` });
          return false;
        }
      }
    }
    return true;
  }

  applyEndTurnStatus(events) {
    for (const side of ['player', 'opponent']) {
      if (this.winner) return;
      const battler = this[side];
      const status = battler.status?.id;
      let damage = 0;
      if (status === 'burn') damage = Math.max(1, Math.floor(battler.maxHp / 16));
      if (status === 'poison') damage = Math.max(1, Math.floor(battler.maxHp / 8));
      if (status === 'toxic') {
        damage = Math.max(1, Math.floor((battler.maxHp * battler.status.counter) / 16));
        battler.status.counter = Math.min(15, battler.status.counter + 1);
      }
      if (!damage) continue;
      damage = Math.min(damage, battler.hp);
      battler.hp -= damage;
      const label = status === 'burn' ? 'burn' : 'poison';
      events.push({ type: 'damage', target: side, amount: damage, hp: battler.hp, maxHp: battler.maxHp, text: `${battler.nickname} was hurt by ${label}!` });
      if (battler.hp <= 0) this.handleFaint(side, side === 'player' ? 'opponent' : 'player', events);
    }
    if (this.weather && !this.winner) {
      for (const side of ['player', 'opponent']) {
        const battler = this[side];
        const vulnerableToHail = this.weather.id === 'hail' && !hasType(battler, 'ice');
        const vulnerableToSand = this.weather.id === 'sandstorm' && !['rock', 'ground', 'steel'].some((type) => hasType(battler, type));
        if (!vulnerableToHail && !vulnerableToSand) continue;
        const damage = Math.min(battler.hp, Math.max(1, Math.floor(battler.maxHp / 16)));
        battler.hp -= damage;
        events.push({ type: 'damage', target: side, amount: damage, hp: battler.hp, maxHp: battler.maxHp, text: `${battler.nickname} was buffeted by the ${this.weather.id === 'hail' ? 'hail' : 'sandstorm'}!` });
        if (battler.hp <= 0) this.handleFaint(side, side === 'player' ? 'opponent' : 'player', events);
      }
      this.weather.turns -= 1;
      if (this.weather.turns <= 0) {
        events.push({ type: 'message', text: 'The weather returned to normal.' });
        this.weather = null;
      }
    }
  }

  resolveSwitch(targetIndex) {
    if (this.winner) throw new Error('The battle is already over.');
    const replacement = this.parties.player[targetIndex];
    if (!replacement || replacement.hp <= 0 || targetIndex === this.activeIndex.player) {
      throw new Error('That Rorymon cannot be switched in.');
    }
    this.activeIndex.player = targetIndex;
    this.player = replacement;
    this.player.stages = { attack: 0, defense: 0, speed: 0 };
    const events = [
      { type: 'turn', turn: this.turn },
      { type: 'switch', target: 'player', species: replacement.id, text: `Mara switched to ${replacement.name}!` },
    ];
    const opponentMove = this.chooseOpponentMove();
    if (this.checkCanAct(this.opponent, events)) {
      events.push(...this.useMove(this.opponent, this.player, opponentMove));
    }
    if (this.opponent.hp <= 0) this.handleFaint('opponent', 'player', events);
    if (this.player.hp <= 0) {
      events.push({ type: 'faint', target: 'player', text: `${this.player.nickname} fainted!` });
      const next = this.sendNext('player');
      if (next) events.push({ type: 'switch', target: 'player', species: next.id, text: `Go, ${next.name}!` });
      else {
        this.winner = 'opponent';
        events.push({ type: 'result', winner: 'opponent', text: `${this.trainerName} won the battle!` });
      }
    }
    if (!this.winner) this.applyEndTurnStatus(events);
    this.turn += 1;
    return { events, state: this.snapshot() };
  }

  chooseOpponentMove() {
    const usable = this.opponent.moves.filter((move) => move.pp > 0);
    const damaging = usable.filter((move) => move.kind === 'damage');
    const weatherMove = usable.find((move) => move.kind === 'weather');
    if (weatherMove && this.weather?.id !== weatherMove.weather && this.rng() < 0.28) return weatherMove;
    if (this.opponent.stages.attack < 1 && this.rng() < 0.2) return usable.find((move) => move.id === 'growth') ?? damaging[0];
    if (this.player.stages.attack > -2 && this.rng() < 0.16) return usable.find((move) => move.id === 'growl') ?? damaging[0];
    return damaging[Math.floor(this.rng() * damaging.length)] ?? usable[0];
  }

  attemptCapture(ballType = 'standard') {
    if (!this.wild) throw new Error('Only wild Rorymon can be captured.');
    if (this.winner) throw new Error('The battle is already over.');
    const target = this.opponent;
    const hpFactor = 1.2 - (target.hp / target.maxHp) * 0.85;
    const statusFactor = target.status ? 1.5 : 1;
    const ballMultiplier = ballType === 'ultra' ? 2 : ballType === 'quick' && this.turn === 1 ? 2.5 : 1;
    const chance = clamp((target.catchRate ?? 0.3) * hpFactor * statusFactor * ballMultiplier, 0.05, 0.95);
    const ballName = ballType === 'ultra' ? 'Ultraroryball' : ballType === 'quick' ? 'Quickroryball' : 'Roryball';
    const events = [
      { type: 'turn', turn: this.turn },
      { type: 'capture-throw', target: 'opponent', ballType, text: `Mara threw a ${ballName}!` },
    ];
    if (this.rng() < chance) {
      const addedToParty = this.parties.player.length < 6;
      this.captured = { id: target.id, name: target.name, level: target.level, variant: target.variant, spriteKey: target.spriteKey, addedToParty };
      if (addedToParty) {
        const newMember = createBattler('player', target.name, target.level, target.id, target.variant);
        newMember.hp = target.hp;
        newMember.status = target.status ? structuredClone(target.status) : null;
        this.parties.player.push(newMember);
      }
      this.winner = 'player';
      events.push({ type: 'captured', target: 'opponent', captured: this.captured, text: `Gotcha! ${target.name} was caught!` });
      events.push({ type: 'result', winner: 'player', captured: true, text: addedToParty ? `${target.name} joined your party!` : `${target.name} was sent to your storage box.` });
      return { events, state: this.snapshot(), chance };
    }
    events.push({ type: 'capture-break', target: 'opponent', text: `${target.name} broke free!` });
    const opponentMove = this.chooseOpponentMove();
    if (this.checkCanAct(target, events)) events.push(...this.useMove(target, this.player, opponentMove));
    if (this.player.hp <= 0) this.handleFaint('player', 'opponent', events);
    if (!this.winner) this.applyEndTurnStatus(events);
    this.turn += 1;
    return { events, state: this.snapshot(), chance };
  }

  resolveTurn(playerMoveId) {
    if (this.winner) throw new Error('The battle is already over.');
    const playerMove = this.player.moves.find((move) => move.id === playerMoveId);
    if (!playerMove || playerMove.pp <= 0) throw new Error('That move cannot be used.');
    const opponentMove = this.chooseOpponentMove();
    const playerSpeed = this.player.speed * stageMultiplier(this.player.stages.speed) * (this.player.status?.id === 'paralysis' ? 0.5 : 1);
    const opponentSpeed = this.opponent.speed * stageMultiplier(this.opponent.stages.speed) * (this.opponent.status?.id === 'paralysis' ? 0.5 : 1);
    const tied = playerSpeed === opponentSpeed;
    const playerFirst = playerSpeed > opponentSpeed || (tied && this.rng() < 0.5);
    const order = playerFirst
      ? [[this.player, this.opponent, playerMove], [this.opponent, this.player, opponentMove]]
      : [[this.opponent, this.player, opponentMove], [this.player, this.opponent, playerMove]];
    const events = [{ type: 'turn', turn: this.turn }];

    for (const [actor, target, move] of order) {
      if (actor.hp <= 0 || target.hp <= 0) continue;
      if (!this.checkCanAct(actor, events)) {
        if (actor.hp <= 0) this.handleFaint(actor.side, target.side, events);
        continue;
      }
      events.push(...this.useMove(actor, target, move));
      if (target.hp <= 0) {
        this.handleFaint(target.side, actor.side, events);
      }
    }
    if (!this.winner) this.applyEndTurnStatus(events);
    this.turn += 1;
    return { events, state: this.snapshot() };
  }

  useMove(actor, target, move) {
    move.pp -= 1;
    const events = [{ type: 'move', actor: actor.side, move: move.id, text: `${actor.nickname} used ${move.name}!` }];
    const accuracy = move.id === 'blizzard' && ['hail', 'snow'].includes(this.weather?.id) ? 100 : move.accuracy;
    if (this.rng() * 100 >= accuracy) {
      events.push({ type: 'message', text: 'But it missed!' });
      return events;
    }
    if (move.kind === 'weather') {
      this.weather = { id: move.weather, turns: 5 };
      const labels = { sandstorm: 'A sandstorm whipped up!', hail: 'Hail began to fall!', snow: 'Snow began to fall!', strong_winds: 'Mysterious strong winds are protecting Flying Rorymon!' };
      events.push({ type: 'weather', weather: move.weather, text: labels[move.weather] });
      return events;
    }
    if (move.kind === 'damage') {
      const damage = Math.min(target.hp, calculateDamage(actor, target, move, this.rng, this.weather));
      target.hp -= damage;
      events.push({ type: 'damage', actor: actor.side, target: target.side, amount: damage, hp: target.hp, maxHp: target.maxHp, text: `${target.nickname} lost ${damage} HP.` });
      const effectiveness = typeEffectiveness(move.type, target, this.weather);
      if (effectiveness > 1) events.push({ type: 'message', text: "It's super effective!" });
      if (effectiveness < 1) events.push({ type: 'message', text: "It isn't very effective…" });
      if (move.effect && this.rng() < move.effect.chance) {
        const recipient = move.effect.target === 'self' ? actor : target;
        if (move.effect.kind === 'status' && recipient.hp > 0 && applyStatus(recipient, move.effect.status, this.rng)) {
          const statusText = { burn: 'was burned', frozen: 'was frozen', paralysis: 'was paralyzed', poison: 'was poisoned', toxic: 'was badly poisoned', sleep: 'fell asleep' };
          events.push({ type: 'status', target: recipient.side, status: move.effect.status, text: `${recipient.nickname} ${statusText[move.effect.status] ?? 'was afflicted'}!` });
        } else if (move.effect.kind === 'stage') {
          const before = recipient.stages[move.effect.stat];
          recipient.stages[move.effect.stat] = clamp(before + move.effect.stages, -6, 6);
          if (recipient.stages[move.effect.stat] !== before) {
            events.push({ type: 'stage', target: recipient.side, stat: move.effect.stat, stages: move.effect.stages, text: `${recipient.nickname}'s Speed ${move.effect.stages > 0 ? 'rose' : 'fell'}!` });
          }
        }
      }
      return events;
    }
    const recipient = move.target === 'self' ? actor : target;
    const before = recipient.stages[move.stat];
    recipient.stages[move.stat] = clamp(before + move.stages, -6, 6);
    if (recipient.stages[move.stat] === before) {
      events.push({ type: 'message', text: `${recipient.nickname}'s ${move.stat[0].toUpperCase() + move.stat.slice(1)} cannot change further.` });
    } else {
      events.push({ type: 'stage', target: recipient.side, stat: move.stat, stages: move.stages, text: `${recipient.nickname}'s ${move.stat[0].toUpperCase() + move.stat.slice(1)} ${move.stages > 0 ? 'rose' : 'fell'}!` });
    }
    return events;
  }
}
