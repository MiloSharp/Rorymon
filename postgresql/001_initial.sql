-- Run once with psql -X --set=ON_ERROR_STOP=1 --file=001_initial.sql
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'rorymon' THEN
  RAISE EXCEPTION 'Connect to the dedicated rorymon database before running this migration';
 END IF;
END $$;
SET LOCAL search_path TO public;
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE types (id TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE abilities (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('approved','provisional')));
CREATE TABLE species (
 id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, stage INTEGER NOT NULL CHECK(stage BETWEEN 1 AND 3), description TEXT NOT NULL,
 hp INTEGER CHECK(hp>0), attack INTEGER CHECK(attack>0), defense INTEGER CHECK(defense>0), special_attack INTEGER CHECK(special_attack>0), special_defense INTEGER CHECK(special_defense>0), speed INTEGER CHECK(speed>0),
 stats_status TEXT NOT NULL DEFAULT 'unassigned', growth_rate TEXT, design_status TEXT NOT NULL
);
CREATE TABLE species_types (species_id TEXT REFERENCES species(id), slot INTEGER CHECK(slot IN (1,2)), type_id TEXT REFERENCES types(id), PRIMARY KEY(species_id,slot), UNIQUE(species_id,type_id));
CREATE TABLE species_abilities (species_id TEXT REFERENCES species(id), ability_id TEXT REFERENCES abilities(id), PRIMARY KEY(species_id,ability_id));
CREATE TABLE natures (id TEXT PRIMARY KEY,name TEXT NOT NULL, increased_stat TEXT, decreased_stat TEXT,
 CHECK((increased_stat IS NULL AND decreased_stat IS NULL) OR (increased_stat IS NOT NULL AND decreased_stat IS NOT NULL AND increased_stat<>decreased_stat)),
 CHECK(increased_stat IN ('attack','defense','special_attack','special_defense','speed')), CHECK(decreased_stat IN ('attack','defense','special_attack','special_defense','speed')));
CREATE TABLE moves (id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,type_id TEXT NOT NULL REFERENCES types(id),category TEXT NOT NULL CHECK(category IN ('physical','special','status')), power INTEGER CHECK(power>0),accuracy INTEGER CHECK(accuracy BETWEEN 1 AND 100),max_pp INTEGER CHECK(max_pp>0), priority INTEGER, description TEXT NOT NULL,effects_json JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(effects_json)='array'),origin TEXT NOT NULL CHECK(origin IN ('original','pokemon_inspired')), inclusion_status TEXT NOT NULL, mechanics_status TEXT NOT NULL);
CREATE TABLE evolutions (from_species TEXT REFERENCES species(id),to_species TEXT REFERENCES species(id),minimum_level INTEGER CHECK(minimum_level BETWEEN 1 AND 100),status TEXT NOT NULL,PRIMARY KEY(from_species,to_species),CHECK(from_species<>to_species));
CREATE TABLE learnsets (species_id TEXT REFERENCES species(id),move_id TEXT REFERENCES moves(id),method TEXT CHECK(method IN ('level','evolution')),level INTEGER,PRIMARY KEY(species_id,move_id,method),CHECK((method='level' AND level IS NOT NULL AND level BETWEEN 1 AND 100) OR (method='evolution' AND level IS NULL)));
CREATE TABLE assets (id TEXT PRIMARY KEY,species_id TEXT NOT NULL REFERENCES species(id),view TEXT CHECK(view IN ('front','rear','icon')),path TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE saves (id TEXT PRIMARY KEY,player_name TEXT NOT NULL,schema_version INTEGER NOT NULL DEFAULT 1,world_state_json JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(world_state_json)='object'));
CREATE TABLE creatures (id TEXT PRIMARY KEY,save_id TEXT NOT NULL REFERENCES saves(id),species_id TEXT NOT NULL REFERENCES species(id),nickname TEXT,level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 100),experience_total INTEGER NOT NULL CHECK(experience_total>=0),nature_id TEXT NOT NULL REFERENCES natures(id),ability_id TEXT REFERENCES abilities(id),current_hp INTEGER NOT NULL CHECK(current_hp>=0),status TEXT,party_slot INTEGER CHECK(party_slot BETWEEN 1 AND 6),UNIQUE(save_id,party_slot));
CREATE TABLE creature_moves (creature_id TEXT REFERENCES creatures(id),slot INTEGER CHECK(slot BETWEEN 1 AND 4),move_id TEXT NOT NULL REFERENCES moves(id),pp_remaining INTEGER NOT NULL CHECK(pp_remaining>=0),PRIMARY KEY(creature_id,slot),UNIQUE(creature_id,move_id));

INSERT INTO metadata ("key", "value") VALUES ('project_name', 'rorymon');
INSERT INTO metadata ("key", "value") VALUES ('named_after', 'Rory');
INSERT INTO metadata ("key", "value") VALUES ('schema_version', '1');
INSERT INTO metadata ("key", "value") VALUES ('setting', 'Alaska/Canada-inspired sub-polar taiga');
INSERT INTO metadata ("key", "value") VALUES ('nature_boost', '1.1');
INSERT INTO metadata ("key", "value") VALUES ('nature_penalty', '0.9');
INSERT INTO metadata ("key", "value") VALUES ('stat_formula_status', 'unassigned');
INSERT INTO metadata ("key", "value") VALUES ('scope', 'No inherited variation or training bonuses yet');
INSERT INTO types ("id", "name") VALUES ('grass', 'Grass');
INSERT INTO types ("id", "name") VALUES ('normal', 'Normal');
INSERT INTO types ("id", "name") VALUES ('ground', 'Ground');
INSERT INTO species ("id", "name", "stage", "description", "hp", "attack", "defense", "special_attack", "special_defense", "speed", "stats_status", "growth_rate", "design_status") VALUES ('mossmoose', 'Mossmoose', 1, 'Stocky grumpy calf, oversized hooves, leafy antler buds and moss cape.', NULL, NULL, NULL, NULL, NULL, NULL, 'unassigned', NULL, 'approved');
INSERT INTO species ("id", "name", "stage", "description", "hp", "attack", "defense", "special_attack", "special_defense", "speed", "stats_status", "growth_rate", "design_status") VALUES ('branchler', 'Branchler', 2, 'Lanky adolescent, branching antlers with green shoots, narrow moss mantle.', NULL, NULL, NULL, NULL, NULL, NULL, 'unassigned', NULL, 'approved');
INSERT INTO species ("id", "name", "stage", "description", "hp", "attack", "defense", "special_attack", "special_defense", "speed", "stats_status", "growth_rate", "design_status") VALUES ('taigant', 'Taigant', 3, 'Massive forest guardian, broad palmate antlers carrying conifers and thick moss mantle.', NULL, NULL, NULL, NULL, NULL, NULL, 'unassigned', NULL, 'approved');
INSERT INTO species_types ("species_id", "slot", "type_id") VALUES ('mossmoose', 1, 'grass');
INSERT INTO species_types ("species_id", "slot", "type_id") VALUES ('branchler', 1, 'grass');
INSERT INTO species_types ("species_id", "slot", "type_id") VALUES ('taigant', 1, 'grass');
INSERT INTO natures ("id", "name", "increased_stat", "decreased_stat") VALUES ('bold', 'Bold', 'defense', 'attack');
INSERT INTO natures ("id", "name", "increased_stat", "decreased_stat") VALUES ('timid', 'Timid', 'speed', 'attack');
INSERT INTO natures ("id", "name", "increased_stat", "decreased_stat") VALUES ('modest', 'Modest', 'special_attack', 'attack');
INSERT INTO natures ("id", "name", "increased_stat", "decreased_stat") VALUES ('adamant', 'Adamant', 'attack', 'special_attack');
INSERT INTO natures ("id", "name", "increased_stat", "decreased_stat") VALUES ('calm', 'Calm', 'special_defense', 'attack');
INSERT INTO natures ("id", "name", "increased_stat", "decreased_stat") VALUES ('hardy', 'Hardy', NULL, NULL);
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('tackle', 'Tackle', 'normal', 'physical', NULL, NULL, NULL, NULL, 'Basic dependable attack.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('growl', 'Growl', 'normal', 'status', NULL, NULL, NULL, NULL, 'Lowers opponent Attack.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('leaf_peck', 'Leaf Peck', 'grass', 'physical', 40, 100, 30, NULL, 'Jab with leafy antlers.', '[]', 'original', 'approved', 'approved_core_priority_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('growth', 'Growth', 'normal', 'status', NULL, NULL, NULL, NULL, 'Builds offensive strength.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('leech_seed', 'Leech Seed', 'grass', 'status', NULL, NULL, NULL, NULL, 'Seeds drain health over time.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('bough_rush', 'Bough Rush', 'grass', 'physical', 65, 100, 20, NULL, 'Running antler strike; 30% chance to raise user Speed one stage after a successful hit.', '[{"trigger": "after_successful_hit", "target": "self", "stat": "speed", "stages": 1, "chance": 0.3}]', 'original', 'approved', 'approved_core_priority_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('stomp', 'Stomp', 'normal', 'physical', NULL, NULL, NULL, NULL, 'Hoof strike that may cause flinching.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('razor_leaf', 'Razor Leaf', 'grass', 'physical', NULL, NULL, NULL, NULL, 'Leaf attack with increased critical-hit chance.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('synthesis', 'Synthesis', 'grass', 'status', NULL, NULL, NULL, NULL, 'Restores health.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('take_down', 'Take Down', 'normal', 'physical', NULL, NULL, NULL, NULL, 'Strong charge with recoil.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('canopy_crash', 'Canopy Crash', 'grass', 'physical', 90, 100, 10, NULL, 'Heavy antler sweep; lowers user Speed one stage after dealing damage.', '[{"trigger": "after_damage_dealt", "target": "self", "stat": "speed", "stages": -1, "chance": 1.0}]', 'original', 'approved', 'approved_core_priority_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('ingrain', 'Ingrain', 'grass', 'status', NULL, NULL, NULL, NULL, 'Roots user for gradual healing; prevents ordinary switching.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('horn_leech', 'Horn Leech', 'grass', 'physical', NULL, NULL, NULL, NULL, 'Heals user based on damage dealt.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('earthquake', 'Earthquake', 'ground', 'physical', NULL, NULL, NULL, NULL, 'Powerful Ground attack.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO moves ("id", "name", "type_id", "category", "power", "accuracy", "max_pp", "priority", "description", "effects_json", "origin", "inclusion_status", "mechanics_status") VALUES ('wood_hammer', 'Wood Hammer', 'grass', 'physical', NULL, NULL, NULL, NULL, 'Very powerful Grass attack with recoil.', '[]', 'pokemon_inspired', 'approved', 'numeric_details_pending');
INSERT INTO evolutions ("from_species", "to_species", "minimum_level", "status") VALUES ('mossmoose', 'branchler', 16, 'approved');
INSERT INTO evolutions ("from_species", "to_species", "minimum_level", "status") VALUES ('branchler', 'taigant', 36, 'approved');
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('mossmoose', 'tackle', 'level', 1);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('mossmoose', 'growl', 'level', 1);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('mossmoose', 'leaf_peck', 'level', 5);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('mossmoose', 'growth', 'level', 9);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('mossmoose', 'leech_seed', 'level', 13);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'tackle', 'level', 1);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'growl', 'level', 1);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'leaf_peck', 'level', 5);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'growth', 'level', 9);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'leech_seed', 'level', 13);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'stomp', 'level', 20);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'razor_leaf', 'level', 25);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'synthesis', 'level', 30);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'take_down', 'level', 34);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'tackle', 'level', 1);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'growl', 'level', 1);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'leaf_peck', 'level', 5);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'growth', 'level', 9);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'leech_seed', 'level', 13);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'stomp', 'level', 20);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'razor_leaf', 'level', 25);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'synthesis', 'level', 30);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'take_down', 'level', 34);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'ingrain', 'level', 40);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'horn_leech', 'level', 45);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'earthquake', 'level', 50);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'wood_hammer', 'level', 56);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('branchler', 'bough_rush', 'evolution', NULL);
INSERT INTO learnsets ("species_id", "move_id", "method", "level") VALUES ('taigant', 'canopy_crash', 'evolution', NULL);
INSERT INTO assets ("id", "species_id", "view", "path", "status") VALUES ('branchler_rear', 'branchler', 'rear', 'assets/branchler-sprite-rear-transparent.png', 'working_art_not_final_game_resolution');
INSERT INTO assets ("id", "species_id", "view", "path", "status") VALUES ('mossmoose_rear', 'mossmoose', 'rear', 'assets/mossmoose-sprite-rear-transparent.png', 'working_art_not_final_game_resolution');
INSERT INTO assets ("id", "species_id", "view", "path", "status") VALUES ('mossmoose_front', 'mossmoose', 'front', 'assets/mossmoose-sprite-front-transparent.png', 'working_art_not_final_game_resolution');
INSERT INTO assets ("id", "species_id", "view", "path", "status") VALUES ('branchler_front', 'branchler', 'front', 'assets/branchler-sprite-front-transparent.png', 'working_art_not_final_game_resolution');
INSERT INTO assets ("id", "species_id", "view", "path", "status") VALUES ('taigant_rear', 'taigant', 'rear', 'assets/taigant-sprite-rear-transparent.png', 'working_art_not_final_game_resolution');
INSERT INTO assets ("id", "species_id", "view", "path", "status") VALUES ('taigant_front', 'taigant', 'front', 'assets/taigant-front-transparent.png', 'working_art_moss_mantle_consistency_pending');
CREATE INDEX creatures_save_idx ON creatures(save_id);
INSERT INTO schema_migrations(version) VALUES (1);
COMMIT;
