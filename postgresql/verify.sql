SELECT current_database() AS database_name;
SELECT version, applied_at FROM schema_migrations;
SELECT 'species' AS entity, count(*) AS actual, 3 AS expected FROM species
UNION ALL SELECT 'moves',count(*),15 FROM moves
UNION ALL SELECT 'natures',count(*),6 FROM natures
UNION ALL SELECT 'evolutions',count(*),2 FROM evolutions
UNION ALL SELECT 'learnsets',count(*),29 FROM learnsets
UNION ALL SELECT 'assets',count(*),6 FROM assets;
