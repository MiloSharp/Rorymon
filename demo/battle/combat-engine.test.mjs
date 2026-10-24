import assert from 'node:assert/strict';
import test from 'node:test';
import { Battle, MOVES, STATUS_CONDITIONS, TOTAMMPOL_VARIANTS, applyConfusion, applyStatus, calculateDamage, createBattler, stageMultiplier } from './combat-engine.js';

test('stat stages use the expected multipliers', () => {
  assert.equal(stageMultiplier(0), 1);
  assert.equal(stageMultiplier(2), 2);
  assert.equal(stageMultiplier(-2), 0.5);
});

test('damage is deterministic with an injected random source', () => {
  const attacker = createBattler('player');
  const defender = createBattler('opponent');
  assert.equal(calculateDamage(attacker, defender, MOVES.tackle, () => 0), 5);
  attacker.stages.attack = 2;
  assert.equal(calculateDamage(attacker, defender, MOVES.tackle, () => 0), 9);
});

test('a turn consumes PP and resolves both actions', () => {
  const battle = new Battle({ rng: () => 0.9 });
  const before = battle.player.moves.find((move) => move.id === 'tackle').pp;
  const result = battle.resolveTurn('tackle');
  assert.equal(result.state.player.moves.find((move) => move.id === 'tackle').pp, before - 1);
  assert.equal(result.events.filter((event) => event.type === 'move').length, 2);
  assert.ok(result.state.opponent.hp < result.state.opponent.maxHp);
});

test('growl lowers the opposing attack stage', () => {
  const battle = new Battle({ rng: () => 0.9 });
  battle.resolveTurn('growl');
  assert.equal(battle.opponent.stages.attack, -1);
});

test('a leveled Mossmoose carries its growth into the next battle', () => {
  const battle = new Battle({ playerLevel: 6, rng: () => 0.9 });
  let mossmoose = battle.parties.player.find((member) => member.id === 'mossmoose');
  assert.equal(mossmoose.level, 6);
  assert.equal(mossmoose.maxHp, 47);
  assert.equal(mossmoose.attack, 27);
  battle.setPlayerLevel(7);
  battle.reset();
  mossmoose = battle.parties.player.find((member) => member.id === 'mossmoose');
  assert.equal(mossmoose.level, 7);
  assert.equal(mossmoose.maxHp, 50);
});

test('a fainted team member is replaced before the battle ends', () => {
  const battle = new Battle({ rng: () => 0.9 });
  battle.opponent.hp = 1;
  const firstKnockout = battle.resolveTurn('tackle');
  assert.equal(firstKnockout.state.winner, null);
  assert.equal(firstKnockout.state.opponent.id, 'mossmoose');
  assert.ok(firstKnockout.events.some((event) => event.type === 'switch'));

  battle.opponent.hp = 1;
  const secondKnockout = battle.resolveTurn('tackle');
  assert.equal(secondKnockout.state.winner, null);
  assert.equal(secondKnockout.state.opponent.id, 'branchler');

  battle.opponent.hp = 1;
  const finalKnockout = battle.resolveTurn('tackle');
  assert.equal(finalKnockout.state.winner, 'player');
});

test('switching brings in a healthy reserve and uses the turn', () => {
  const battle = new Battle({ rng: () => 0.9 });
  const result = battle.resolveSwitch(1);
  assert.equal(result.state.player.id, 'branchler');
  assert.equal(result.state.activeIndex.player, 1);
  assert.equal(result.state.turn, 2);
  assert.ok(result.events.some((event) => event.type === 'switch'));
  assert.ok(result.state.player.hp < result.state.player.maxHp);
  assert.throws(() => battle.resolveSwitch(1), /cannot be switched/i);
});

test('Branchler knows Bough Rush and can gain Speed from it', () => {
  const battle = new Battle({ rng: () => 0.1 });
  const branchler = createBattler('player', 'Branchler', 5, 'branchler');
  assert.deepEqual(branchler.moves.map((move) => move.id), ['tackle', 'leaf_peck', 'growl', 'bough_rush']);
  const boughRush = branchler.moves.find((move) => move.id === 'bough_rush');
  const events = battle.useMove(branchler, battle.opponent, boughRush);
  assert.equal(branchler.stages.speed, 1);
  assert.ok(events.some((event) => event.type === 'stage' && event.stat === 'speed'));
});

test('Taigant knows Canopy Crash and loses Speed after using it', () => {
  const battle = new Battle({ rng: () => 0.1 });
  const taigant = createBattler('player', 'Taigant', 5, 'taigant');
  assert.deepEqual(taigant.moves.map((move) => move.id), ['tackle', 'leaf_peck', 'growl', 'canopy_crash']);
  const canopyCrash = taigant.moves.find((move) => move.id === 'canopy_crash');
  const events = battle.useMove(taigant, battle.opponent, canopyCrash);
  assert.equal(taigant.stages.speed, -1);
  assert.ok(events.some((event) => event.type === 'stage' && event.stat === 'speed'));
});

test('each trainer receives three unique species and Kellan leads with Totammpöl', () => {
  const battle = new Battle({ rng: () => 0.1 });
  const playerSpecies = battle.parties.player.map((member) => member.id);
  const opponentSpecies = battle.parties.opponent.map((member) => member.id);
  assert.equal(playerSpecies.length, 3);
  assert.equal(new Set(playerSpecies).size, 3);
  assert.ok(playerSpecies.every((id) => ['mossmoose', 'branchler', 'taigant', 'cubice'].includes(id)));
  assert.equal(opponentSpecies.length, 3);
  assert.equal(new Set(opponentSpecies).size, 3);
  assert.equal(opponentSpecies[0], 'totammpol');
});

test('the level 30 demo uses level 30 teams and all 24 valid Totammpöl assemblies', () => {
  assert.equal(TOTAMMPOL_VARIANTS.length, 24);
  assert.ok(TOTAMMPOL_VARIANTS.every(({ top, middle, bottom }) => new Set([top, middle, bottom]).size === 3));
  const battle = new Battle({ rng: () => 0.4, playerLevel: 30, highLevel: true });
  assert.ok([...battle.parties.player, ...battle.parties.opponent].every((member) => member.level === 30));
  assert.ok(battle.parties.player.some((member) => member.id === 'totammpol'));
  assert.ok(battle.parties.opponent.some((member) => member.id === 'totammpol'));
});

test('a level 30 Totammpöl builds moves and typing from its three modules', () => {
  const variant = TOTAMMPOL_VARIANTS.find((item) => item.key === 'eagle-bear-goat');
  const totammpol = createBattler('player', 'Totammpöl', 30, 'totammpol', variant);
  assert.deepEqual([totammpol.type, totammpol.secondaryType], ['flying', 'ice']);
  assert.deepEqual(totammpol.moves.map((move) => move.id), ['wing_gust', 'sky_dive', 'blizzard', 'hail']);
  assert.equal(totammpol.spriteKey, 'totammpol-eagle-bear-goat');
});

test('a low-level Totammpöl only receives its typed move from the top animal', () => {
  const variant = TOTAMMPOL_VARIANTS.find((item) => item.key === 'moose-bear-goat');
  const totammpol = createBattler('opponent', 'Wild Totammpöl', 5, 'totammpol', variant);
  assert.deepEqual(totammpol.moves.map((move) => move.id), ['tackle', 'growl', 'growth', 'leaf_peck']);
  assert.ok(!totammpol.moves.some((move) => move.id === 'wing_gust'));
});

test('wild encounters use one randomized wild opponent', () => {
  const battle = new Battle({ rng: () => 0.25, playerLevel: 5, wild: true });
  assert.equal(battle.parties.opponent.length, 1);
  assert.match(battle.opponent.nickname, /^Wild /);
  assert.equal(battle.parties.player.length, 3);
});

test('a requested overworld encounter becomes the wild battle opponent', () => {
  const battle = new Battle({ rng: () => 0.25, playerLevel: 5, wild: true, wildSpecies: 'totammpol' });
  assert.equal(battle.parties.opponent.length, 1);
  assert.equal(battle.opponent.id, 'totammpol');
  assert.equal(battle.opponent.nickname, 'Wild Totammpöl');
  assert.ok(battle.opponent.variant);
  assert.equal(new Set(Object.values(battle.opponent.variant).slice(0, 3)).size, 3);
});

test('Jadekid and Nephram are available as Rock-type wild encounters', () => {
  const jadekid = new Battle({ rng: () => 0.25, wild: true, wildSpecies: 'jadekid', wildLevel: 5 });
  assert.equal(jadekid.opponent.id, 'jadekid');
  assert.equal(jadekid.opponent.type, 'rock');
  assert.ok(jadekid.opponent.moves.some((move) => move.id === 'rock_throw'));

  const nephram = new Battle({ rng: () => 0.25, wild: true, wildSpecies: 'nephram', wildLevel: 12 });
  assert.equal(nephram.opponent.id, 'nephram');
  assert.equal(nephram.opponent.level, 12);
  assert.equal(nephram.opponent.type, 'rock');
});

test('a weakened wild Rorymon can be captured', () => {
  const battle = new Battle({ rng: () => 0, playerLevel: 5, wild: true });
  const startingPartySize = battle.parties.player.length;
  battle.opponent.hp = 1;
  const result = battle.attemptCapture();
  assert.equal(result.state.winner, 'player');
  assert.equal(result.state.captured.id, battle.opponent.id);
  assert.equal(result.state.captured.addedToParty, true);
  assert.equal(result.state.parties.player.length, startingPartySize + 1);
  assert.ok(result.events.some((event) => event.type === 'captured'));
});

test('a captured Rorymon is marked for storage when the party is full', () => {
  const roster = ['mossmoose', 'branchler', 'taigant', 'cubice', 'jadekid', 'nephram']
    .map((id) => ({ id, level: 5 }));
  const battle = new Battle({ wild: true, wildSpecies: 'mossmoose', playerRoster: roster, rng: () => 0 });
  battle.opponent.hp = 1;
  const result = battle.attemptCapture();
  assert.equal(result.state.captured.addedToParty, false);
  assert.equal(result.state.parties.player.length, 6);
  assert.match(result.events.at(-1).text, /storage box/);
});

test('premium Roryballs modify capture chance', () => {
  const standard = new Battle({ wild: true, wildSpecies: 'mossmoose', rng: () => 0.99 });
  const ultra = new Battle({ wild: true, wildSpecies: 'mossmoose', rng: () => 0.99 });
  const quick = new Battle({ wild: true, wildSpecies: 'mossmoose', rng: () => 0.99 });
  const standardChance = standard.attemptCapture('standard').chance;
  const ultraChance = ultra.attemptCapture('ultra').chance;
  const quickChance = quick.attemptCapture('quick').chance;
  assert.ok(ultraChance > standardChance);
  assert.ok(quickChance > ultraChance);
  quick.turn = 2;
  assert.equal(quick.attemptCapture('quick').chance, standardChance);
});

test('wild encounters load a previously saved player party', () => {
  const playerRoster = [
    { id: 'cubice', level: 8 },
    { id: 'branchler', level: 7 },
    { id: 'mossmoose', level: 6 },
    { id: 'taigant', level: 5 },
  ];
  const battle = new Battle({ rng: () => 0.25, playerLevel: 5, wild: true, playerRoster });
  assert.deepEqual(battle.parties.player.map(({ id, level }) => ({ id, level })), playerRoster);
});

test('wild encounters restore saved HP, status, and move PP', () => {
  const saved = createBattler('player', 'Mossmoose', 5, 'mossmoose');
  const tackle = saved.moves.find((move) => move.id === 'tackle');
  const battle = new Battle({
    wild: true,
    wildSpecies: 'cubice',
    playerRoster: [{
      id: saved.id,
      level: saved.level,
      hp: 9,
      status: { id: 'burn', turns: null, counter: null },
      moves: [{ id: 'tackle', pp: tackle.maxPp - 4 }],
    }],
  });
  assert.equal(battle.player.hp, 9);
  assert.equal(battle.player.status.id, 'burn');
  assert.equal(battle.player.moves.find((move) => move.id === 'tackle').pp, tackle.maxPp - 4);
  assert.equal(battle.player.moves.find((move) => move.id === 'leaf_peck').pp, battle.player.moves.find((move) => move.id === 'leaf_peck').maxPp);
});

test('trainer battles load the persistent player roster and use the trainer name', () => {
  const battle = new Battle({
    trainerName: 'Nora',
    playerRoster: [{ id: 'jadekid', level: 8, hp: 12 }],
  });
  assert.equal(battle.player.id, 'jadekid');
  assert.equal(battle.player.hp, 12);
  assert.match(battle.opponent.nickname, /^Nora's /);
});

test('a failed capture lets the wild Rorymon act', () => {
  const battle = new Battle({ rng: () => 0.99, playerLevel: 5, wild: true });
  const result = battle.attemptCapture();
  assert.equal(result.state.captured, null);
  assert.ok(result.events.some((event) => event.text?.includes('broke free')));
  assert.ok(result.events.some((event) => event.type === 'move' && event.actor === 'opponent'));
});

test('Frost Paw can freeze its target', () => {
  const battle = new Battle({ rng: () => 0.05 });
  const cubice = createBattler('player', 'Cubice', 5, 'cubice');
  const target = createBattler('opponent');
  const frostPaw = cubice.moves.find((move) => move.id === 'frost_paw');
  const events = battle.useMove(cubice, target, frostPaw);
  assert.equal(target.status.id, 'frozen');
  assert.ok(events.some((event) => event.type === 'status' && event.status === 'frozen'));
});

test('all major status conditions can be applied and Ice types resist freezing', () => {
  for (const statusId of Object.keys(STATUS_CONDITIONS)) {
    const target = createBattler('player');
    assert.equal(applyStatus(target, statusId, () => 0), true);
    assert.equal(target.status.id, statusId);
  }
  const cubice = createBattler('player', 'Cubice', 5, 'cubice');
  assert.equal(applyStatus(cubice, 'frozen'), false);
});

test('burn lowers physical damage and burn, poison, and toxic deal residual damage', () => {
  const attacker = createBattler('player');
  const defender = createBattler('opponent');
  const normalDamage = calculateDamage(attacker, defender, MOVES.tackle, () => 0);
  applyStatus(attacker, 'burn');
  assert.ok(calculateDamage(attacker, defender, MOVES.tackle, () => 0) < normalDamage);

  const battle = new Battle({ rng: () => 0.9 });
  for (const statusId of ['burn', 'poison', 'toxic']) {
    battle.player.status = null;
    battle.player.hp = battle.player.maxHp;
    applyStatus(battle.player, statusId);
    const before = battle.player.hp;
    battle.applyEndTurnStatus([]);
    assert.ok(battle.player.hp < before);
  }
});

test('sleep, paralysis, freeze, and confusion can prevent actions', () => {
  const battle = new Battle({ rng: () => 0.1 });
  const actor = battle.player;
  applyStatus(actor, 'sleep', () => 0);
  assert.equal(battle.checkCanAct(actor, []), false);
  assert.equal(battle.checkCanAct(actor, []), true);

  applyStatus(actor, 'paralysis');
  assert.equal(battle.checkCanAct(actor, []), false);
  actor.status = null;
  applyStatus(actor, 'frozen');
  battle.rng = () => 0.9;
  assert.equal(battle.checkCanAct(actor, []), false);

  actor.status = null;
  applyConfusion(actor, () => 0);
  battle.rng = () => 0.1;
  const before = actor.hp;
  assert.equal(battle.checkCanAct(actor, []), false);
  assert.ok(actor.hp < before);
});

test('editor definitions create playable Rorymon with custom moves', () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  try {
    localStorage.setItem('rorymon-content-editor', JSON.stringify({
      moves: { pebble_pop: { id: 'pebble_pop', name: 'Pebble Pop', type: 'rock', kind: 'damage', power: 55, accuracy: 100, maxPp: 18 } },
      species: { testling: { id: 'testling', name: 'Testling', type: 'rock', level: 4, maxHp: 41, attack: 24, defense: 28, speed: 17, catchRate: 0.5, spriteKey: 'jadekid', artworkFront: 'data:image/webp;base64,front', artworkHighRear: 'data:image/webp;base64,rear', moves: ['pebble_pop', 'tackle'] } },
    }));
    const battler = createBattler('player', 'Testling', 4, 'testling');
    assert.equal(battler.name, 'Testling');
    assert.equal(battler.spriteKey, 'jadekid');
    assert.equal(battler.artworkFront, 'data:image/webp;base64,front');
    assert.equal(battler.artworkHighRear, 'data:image/webp;base64,rear');
    assert.deepEqual(battler.moves.map((move) => move.id), ['pebble_pop', 'tackle']);
    assert.equal(battler.moves[0].power, 55);
  } finally {
    delete globalThis.localStorage;
  }
});

test('the complete Cubice evolution family is available', () => {
  const icebearg = createBattler('player', 'Icebearg', 16, 'icebearg');
  const glaciursus = createBattler('player', 'Glaciursus', 32, 'glaciursus');
  assert.equal(icebearg.type, 'ice');
  assert.equal(icebearg.spriteKey, 'icebearg');
  assert.deepEqual(icebearg.moves.map((move) => move.id), ['frost_paw', 'ice_fang', 'snow_guard', 'growl']);
  assert.equal(glaciursus.defense, 92);
  assert.equal(glaciursus.spriteKey, 'glaciursus');
  assert.deepEqual(glaciursus.moves.map((move) => move.id), ['ice_fang', 'blizzard', 'snow_guard', 'hail']);
});
