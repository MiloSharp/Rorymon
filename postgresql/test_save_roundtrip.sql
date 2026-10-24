-- Exercises the v2 save model without retaining test data.
BEGIN;
INSERT INTO saves(id, player_name, schema_version) VALUES ('__save_model_test__', 'Rory', 2);
INSERT INTO player_profiles(save_id, trainer_number, secret_number, money)
 VALUES ('__save_model_test__', 314159, 27182, 3000);
INSERT INTO player_positions(save_id, map_id, x, y, facing)
 VALUES ('__save_model_test__', 'taiga_start', 10, 12, 'south');
INSERT INTO storage_boxes(save_id, box_number, name)
 VALUES ('__save_model_test__', 1, 'Taiga Friends');
INSERT INTO creatures(
 id, save_id, species_id, nickname, level, experience_total, nature_id,
 current_hp, personality_value, original_trainer_number, original_trainer_name,
 gender, friendship, met_map_id, met_level
) VALUES (
 '__save_model_creature__', '__save_model_test__', 'mossmoose', 'Mossy', 5, 125, 'hardy',
 20, 1234567890, 314159, 'Rory', 'female', 70, 'taiga_start', 5
);
INSERT INTO creature_training(creature_id, hp_iv, attack_iv, defense_iv, speed_iv)
 VALUES ('__save_model_creature__', 20, 18, 22, 15);
INSERT INTO storage_placements(save_id, box_number, slot, creature_id)
 VALUES ('__save_model_test__', 1, 1, '__save_model_creature__');
INSERT INTO pokedex_entries(save_id, species_id, seen, caught)
 VALUES ('__save_model_test__', 'mossmoose', TRUE, TRUE);
INSERT INTO game_options(save_id, text_speed, autosave_enabled)
 VALUES ('__save_model_test__', 'fast', TRUE);
INSERT INTO save_slots(save_id, slot) VALUES
 ('__save_model_test__', 1), ('__save_model_test__', 2);
UPDATE save_slots
 SET sequence_number = 1, state = 'writing', started_at = CURRENT_TIMESTAMP
 WHERE save_id = '__save_model_test__' AND slot = 1;
INSERT INTO save_blocks(save_slot_id, block_key, payload, payload_bytes, checksum)
 SELECT id, 'player', '{"player_name":"Rory"}'::jsonb, 22, decode(repeat('00', 32), 'hex')
 FROM save_slots WHERE save_id = '__save_model_test__' AND slot = 1;
UPDATE save_slots
 SET state = 'valid', is_active = TRUE, commit_id = 'test-commit-1',
     root_checksum = decode(repeat('11', 32), 'hex'), committed_at = CURRENT_TIMESTAMP
 WHERE save_id = '__save_model_test__' AND slot = 1;

DO $$
BEGIN
 BEGIN
  UPDATE creatures SET party_slot = 1 WHERE id = '__save_model_creature__';
  RAISE EXCEPTION 'Expected party/storage exclusivity check to reject the update';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM = 'Expected party/storage exclusivity check to reject the update' THEN RAISE; END IF;
 END;
 BEGIN
  UPDATE save_slots
   SET sequence_number = 2, state = 'valid', is_active = TRUE,
       commit_id = 'test-commit-2', root_checksum = decode(repeat('22', 32), 'hex'),
       committed_at = CURRENT_TIMESTAMP
   WHERE save_id = '__save_model_test__' AND slot = 2;
  RAISE EXCEPTION 'Expected one-active-slot check to reject the insert';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
END $$;

SELECT save_id, slot, sequence_number, commit_id
FROM recoverable_save_slots
WHERE save_id = '__save_model_test__';
ROLLBACK;
