SELECT current_database() AS database_name, current_user AS role_name;
SELECT array_agg(version ORDER BY version) AS applied_migrations FROM schema_migrations;
SELECT value AS schema_version FROM metadata WHERE key = 'schema_version';
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
 AND table_name IN (
  'save_slots', 'save_blocks', 'player_profiles', 'player_positions',
  'story_flags', 'story_variables', 'inventory', 'storage_boxes',
  'storage_placements', 'creature_training', 'pokedex_entries', 'game_options'
 )
ORDER BY table_name;
SELECT 'species' AS entity, count(*) AS actual, 3 AS expected FROM species
UNION ALL SELECT 'moves',count(*),15 FROM moves
UNION ALL SELECT 'natures',count(*),6 FROM natures
UNION ALL SELECT 'evolutions',count(*),2 FROM evolutions
UNION ALL SELECT 'learnsets',count(*),29 FROM learnsets
UNION ALL SELECT 'assets',count(*),6 FROM assets;
