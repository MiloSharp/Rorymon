# Mossmoose battle prototype

Start the included local server with `node server.mjs`, then open `http://127.0.0.1:4173/`. The demo opens with a four-part trainer introduction featuring Field Researcher Mara and Young Trainer Kellan. Use Continue, Enter, or Space to advance, or Skip intro to begin combat immediately. Mara randomly receives three unique members chosen from Mossmoose, Branchler, Taigant, and Cubice. Kellan currently leads with the eagle/bear/goat Totammpöl sprite for visual evaluation and receives two random reserve partners. The next healthy party member enters automatically after a knockout, and the match ends when one trainer's full party has fainted. Parties are redrawn for rematches.

Switch Rorymon opens the player's party list. Choosing a healthy reserve uses the
turn, resets that Rorymon's temporary Attack stage, and allows Kellan to attack.

Branchler replaces Growth with its approved evolution move, Bough Rush: a
65-power Grass attack with a 30% chance to raise the user's Speed. Bough Rush
currently uses the supplied Magical Leaf sound effect.

Taigant has its approved evolution move, Canopy Crash: a 90-power Grass attack
that lowers the user's Speed after dealing damage. It temporarily reuses the
Tackle sound effect.

Cubice uses Tackle, Growl, Frost Paw, and Snow Guard. Frost Paw is a 40-power
Ice attack with a 10% chance to freeze its target. Frozen Rorymon have a 20%
chance to thaw whenever they attempt to act; otherwise they lose that action.
Snow Guard raises the user's Defense.

## Level 30 exhibition

Open `http://127.0.0.1:4173/demo/battle/?battle=1&level=30` for a randomized level-30 battle with stronger move sets. Both trainers receive three unique Rorymon and are guaranteed one randomized Totammpöl. All 24 valid eagle, bear, moose, and goat orders are available; no animal repeats within an assembly. Totammpöl receives two moves from its top animal, an advanced move from its middle animal, and Sandstorm, Hail, Snow, or Strong Winds from its bottom animal. Starting another battle redraws both teams and both Totammpöl assemblies.

The reusable status engine follows Generation VII-style behavior for burn,
freeze, paralysis, poison, badly poisoned, sleep, and confusion. Burn halves
physical damage and removes 1/16 maximum HP each turn; poison removes 1/8;
bad poison increases from 1/16 each turn; paralysis halves Speed and has a 25%
full-paralysis chance; sleep lasts 1–3 turns; freeze has a 20% thaw chance; and
confusion lasts 1–4 turns with a one-third self-hit chance. Ice types cannot be
frozen. HUD names display BRN, FRZ, PAR, PSN, TOX, or SLP, and `?` for confusion.

Winning awards 65 shared team experience points. Experience animates into the
player HUD, levels carry across rematches for the current browser session, and
each new level raises all three partners' HP, Attack, Defense, and Speed.

Tackle, Growl, Growth, and Leaf Peck play their supplied move sound effects.
Leaf Peck currently uses the supplied Leaf Blade sound.

An original synthesized battle theme begins with combat and stops when the match
ends. The Music button in the arena can toggle it at any time.

The species stats and the numeric values for Tackle, Growl and Growth are temporary demo values because the canonical dataset marks them as unassigned. Leaf Peck retains its approved 40 power and 100 accuracy.

Run the engine tests from this directory with:

```powershell
node --test combat-engine.test.mjs
```
