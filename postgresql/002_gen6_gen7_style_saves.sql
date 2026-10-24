-- Generation VI-VII-inspired logical save model for Rorymon.
-- This is an original relational design, not a reproduction of a proprietary format.
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'rorymon' THEN
  RAISE EXCEPTION 'Connect to the dedicated rorymon database before running this migration';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 1) THEN
  RAISE EXCEPTION 'Migration 001 must be applied before migration 002';
 END IF;
 IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = 2) THEN
  RAISE EXCEPTION 'Migration 002 has already been applied';
 END IF;
END $$;
SET LOCAL search_path TO public;

-- Two rotating slots allow the application to keep the last known-good save while
-- a newer snapshot is being written and validated.
CREATE TABLE save_slots (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
 slot SMALLINT NOT NULL CHECK(slot IN (1, 2)),
 sequence_number BIGINT NOT NULL DEFAULT 0 CHECK(sequence_number >= 0),
 state TEXT NOT NULL DEFAULT 'empty' CHECK(state IN ('empty', 'writing', 'valid', 'invalid')),
 is_active BOOLEAN NOT NULL DEFAULT FALSE,
 format_version INTEGER NOT NULL DEFAULT 2 CHECK(format_version > 0),
 commit_id TEXT,
 checksum_algorithm TEXT NOT NULL DEFAULT 'sha256' CHECK(checksum_algorithm = 'sha256'),
 root_checksum BYTEA,
 started_at TIMESTAMPTZ,
 committed_at TIMESTAMPTZ,
 UNIQUE(save_id, slot),
 CHECK(root_checksum IS NULL OR octet_length(root_checksum) = 32),
 CHECK(state <> 'valid' OR (commit_id IS NOT NULL AND root_checksum IS NOT NULL AND committed_at IS NOT NULL)),
 CHECK(NOT is_active OR state = 'valid')
);
CREATE UNIQUE INDEX save_slots_one_active_idx ON save_slots(save_id) WHERE is_active;
CREATE UNIQUE INDEX save_slots_sequence_idx ON save_slots(save_id, sequence_number) WHERE sequence_number > 0;
CREATE INDEX save_slots_recovery_idx ON save_slots(save_id, state, sequence_number DESC);

-- Blocks mirror the independently checked sections used by resilient console saves.
-- Payloads remain JSONB so the application can reproduce and hash canonical blocks.
CREATE TABLE save_blocks (
 save_slot_id BIGINT NOT NULL REFERENCES save_slots(id) ON DELETE CASCADE,
 block_key TEXT NOT NULL CHECK(block_key ~ '^[a-z][a-z0-9_]{0,62}$'),
 block_version INTEGER NOT NULL DEFAULT 1 CHECK(block_version > 0),
 payload JSONB NOT NULL CHECK(jsonb_typeof(payload) = 'object'),
 payload_bytes INTEGER NOT NULL CHECK(payload_bytes >= 0),
 checksum BYTEA NOT NULL CHECK(octet_length(checksum) = 32),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(save_slot_id, block_key)
);

CREATE TABLE player_profiles (
 save_id TEXT PRIMARY KEY REFERENCES saves(id) ON DELETE CASCADE,
 trainer_number INTEGER NOT NULL CHECK(trainer_number BETWEEN 0 AND 999999),
 secret_number INTEGER NOT NULL CHECK(secret_number BETWEEN 0 AND 65535),
 pronouns TEXT,
 appearance JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(appearance) = 'object'),
 money INTEGER NOT NULL DEFAULT 0 CHECK(money BETWEEN 0 AND 9999999),
 play_time_seconds BIGINT NOT NULL DEFAULT 0 CHECK(play_time_seconds >= 0),
 started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_saved_at TIMESTAMPTZ,
 last_heal_location TEXT
);

CREATE TABLE player_positions (
 save_id TEXT PRIMARY KEY REFERENCES saves(id) ON DELETE CASCADE,
 map_id TEXT NOT NULL,
 x INTEGER NOT NULL,
 y INTEGER NOT NULL,
 z INTEGER NOT NULL DEFAULT 0,
 facing TEXT NOT NULL CHECK(facing IN ('north', 'east', 'south', 'west')),
 movement_mode TEXT NOT NULL DEFAULT 'walk',
 respawn_map_id TEXT,
 respawn_x INTEGER,
 respawn_y INTEGER,
 respawn_z INTEGER,
 CHECK((respawn_map_id IS NULL) = (respawn_x IS NULL)),
 CHECK((respawn_map_id IS NULL) = (respawn_y IS NULL))
);

CREATE TABLE story_flags (
 save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
 flag_key TEXT NOT NULL,
 value BOOLEAN NOT NULL DEFAULT TRUE,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(save_id, flag_key)
);
CREATE TABLE story_variables (
 save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
 variable_key TEXT NOT NULL,
 value JSONB NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(save_id, variable_key)
);

CREATE TABLE inventory (
 save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
 pocket TEXT NOT NULL CHECK(pocket IN ('items', 'medicine', 'capture', 'battle', 'key', 'materials')),
 item_id TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 0 AND 999),
 sort_order INTEGER NOT NULL CHECK(sort_order >= 0),
 is_registered BOOLEAN NOT NULL DEFAULT FALSE,
 PRIMARY KEY(save_id, pocket, item_id),
 UNIQUE(save_id, pocket, sort_order),
 CHECK(pocket = 'key' OR NOT is_registered)
);

CREATE TABLE storage_boxes (
 save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
 box_number SMALLINT NOT NULL CHECK(box_number BETWEEN 1 AND 32),
 name TEXT NOT NULL,
 wallpaper_id TEXT,
 PRIMARY KEY(save_id, box_number)
);

ALTER TABLE creatures
 ADD COLUMN personality_value BIGINT CHECK(personality_value BETWEEN 0 AND 4294967295),
 ADD COLUMN original_trainer_number INTEGER CHECK(original_trainer_number BETWEEN 0 AND 999999),
 ADD COLUMN original_trainer_name TEXT,
 ADD COLUMN gender TEXT CHECK(gender IN ('female', 'male', 'genderless')),
 ADD COLUMN is_shiny BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN form_id TEXT NOT NULL DEFAULT 'default',
 ADD COLUMN friendship SMALLINT NOT NULL DEFAULT 0 CHECK(friendship BETWEEN 0 AND 255),
 ADD COLUMN held_item_id TEXT,
 ADD COLUMN capture_device_id TEXT,
 ADD COLUMN met_map_id TEXT,
 ADD COLUMN met_level SMALLINT CHECK(met_level BETWEEN 1 AND 100),
 ADD COLUMN met_at TIMESTAMPTZ,
 ADD COLUMN is_egg BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN language_code TEXT NOT NULL DEFAULT 'en' CHECK(language_code ~ '^[a-z]{2}(-[A-Z]{2})?$');

CREATE TABLE creature_training (
 creature_id TEXT PRIMARY KEY REFERENCES creatures(id) ON DELETE CASCADE,
 hp_iv SMALLINT NOT NULL DEFAULT 0 CHECK(hp_iv BETWEEN 0 AND 31),
 attack_iv SMALLINT NOT NULL DEFAULT 0 CHECK(attack_iv BETWEEN 0 AND 31),
 defense_iv SMALLINT NOT NULL DEFAULT 0 CHECK(defense_iv BETWEEN 0 AND 31),
 special_attack_iv SMALLINT NOT NULL DEFAULT 0 CHECK(special_attack_iv BETWEEN 0 AND 31),
 special_defense_iv SMALLINT NOT NULL DEFAULT 0 CHECK(special_defense_iv BETWEEN 0 AND 31),
 speed_iv SMALLINT NOT NULL DEFAULT 0 CHECK(speed_iv BETWEEN 0 AND 31),
 hp_ev SMALLINT NOT NULL DEFAULT 0 CHECK(hp_ev BETWEEN 0 AND 252),
 attack_ev SMALLINT NOT NULL DEFAULT 0 CHECK(attack_ev BETWEEN 0 AND 252),
 defense_ev SMALLINT NOT NULL DEFAULT 0 CHECK(defense_ev BETWEEN 0 AND 252),
 special_attack_ev SMALLINT NOT NULL DEFAULT 0 CHECK(special_attack_ev BETWEEN 0 AND 252),
 special_defense_ev SMALLINT NOT NULL DEFAULT 0 CHECK(special_defense_ev BETWEEN 0 AND 252),
 speed_ev SMALLINT NOT NULL DEFAULT 0 CHECK(speed_ev BETWEEN 0 AND 252),
 CHECK(hp_ev + attack_ev + defense_ev + special_attack_ev + special_defense_ev + speed_ev <= 510)
);

CREATE TABLE storage_placements (
 save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
 box_number SMALLINT NOT NULL,
 slot SMALLINT NOT NULL CHECK(slot BETWEEN 1 AND 30),
 creature_id TEXT NOT NULL UNIQUE REFERENCES creatures(id) ON DELETE CASCADE,
 PRIMARY KEY(save_id, box_number, slot),
 FOREIGN KEY(save_id, box_number) REFERENCES storage_boxes(save_id, box_number) ON DELETE CASCADE
);

CREATE FUNCTION validate_storage_placement() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
 creature_save_id TEXT;
 creature_party_slot INTEGER;
BEGIN
 SELECT save_id, party_slot INTO creature_save_id, creature_party_slot
 FROM creatures WHERE id = NEW.creature_id;
 IF creature_save_id IS DISTINCT FROM NEW.save_id THEN
  RAISE EXCEPTION 'Stored creature must belong to the same save';
 END IF;
 IF creature_party_slot IS NOT NULL THEN
  RAISE EXCEPTION 'A creature cannot be in the party and storage simultaneously';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER storage_placements_validate
 BEFORE INSERT OR UPDATE ON storage_placements
 FOR EACH ROW EXECUTE FUNCTION validate_storage_placement();

CREATE FUNCTION validate_party_placement() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.party_slot IS NOT NULL AND EXISTS (
  SELECT 1 FROM storage_placements WHERE creature_id = NEW.id
 ) THEN
  RAISE EXCEPTION 'A creature cannot be in the party and storage simultaneously';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER creatures_party_validate
 BEFORE UPDATE OF party_slot ON creatures
 FOR EACH ROW EXECUTE FUNCTION validate_party_placement();

CREATE TABLE pokedex_entries (
 save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
 species_id TEXT NOT NULL REFERENCES species(id),
 seen BOOLEAN NOT NULL DEFAULT FALSE,
 caught BOOLEAN NOT NULL DEFAULT FALSE,
 first_seen_at TIMESTAMPTZ,
 first_caught_at TIMESTAMPTZ,
 forms_seen JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(forms_seen) = 'array'),
 PRIMARY KEY(save_id, species_id),
 CHECK(NOT caught OR seen)
);

CREATE TABLE game_options (
 save_id TEXT PRIMARY KEY REFERENCES saves(id) ON DELETE CASCADE,
 text_speed TEXT NOT NULL DEFAULT 'normal' CHECK(text_speed IN ('slow', 'normal', 'fast')),
 battle_animations BOOLEAN NOT NULL DEFAULT TRUE,
 battle_style TEXT NOT NULL DEFAULT 'shift' CHECK(battle_style IN ('shift', 'set')),
 music_volume SMALLINT NOT NULL DEFAULT 100 CHECK(music_volume BETWEEN 0 AND 100),
 effects_volume SMALLINT NOT NULL DEFAULT 100 CHECK(effects_volume BETWEEN 0 AND 100),
 autosave_enabled BOOLEAN NOT NULL DEFAULT TRUE,
 settings_json JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(settings_json) = 'object')
);

CREATE VIEW recoverable_save_slots AS
 SELECT DISTINCT ON (save_id)
  id, save_id, slot, sequence_number, commit_id, root_checksum, committed_at
 FROM save_slots
 WHERE state = 'valid'
 ORDER BY save_id, sequence_number DESC, committed_at DESC;

UPDATE metadata SET value = '2' WHERE key = 'schema_version';
INSERT INTO metadata(key, value) VALUES
 ('save_format', 'Rorymon redundant block save v2'),
 ('save_integrity', 'Application-computed SHA-256 per block and per committed slot')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO schema_migrations(version) VALUES (2);
COMMIT;
