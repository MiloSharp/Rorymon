# Rorymon: local PostgreSQL setup

Use the existing local PostgreSQL installation that hosts Lorewalker. Create a separate database named `rorymon` and a dedicated non-superuser login named `rorymon_app`. This package does not connect to or modify your installation automatically.

## Create the database
Run these commands in PowerShell with PostgreSQL's bin folder on PATH. Substitute the host, port and administrator username if your installation differs. The password prompts are local; no credentials belong in the project files.

```powershell
createuser --host=localhost --port=5432 --username=postgres --pwprompt --no-superuser --no-createdb --no-createrole rorymon_app
createdb --host=localhost --port=5432 --username=postgres --owner=rorymon_app rorymon
```

`createuser` prompts for the NEW role's password, and may also request the administrator password. If a role or database with these names already exists, stop and inspect it; do not drop or overwrite it.

## Apply and verify
From this postgresql folder:

```powershell
psql -X --host=localhost --port=5432 --username=rorymon_app --dbname=rorymon --set=ON_ERROR_STOP=1 --file=001_initial.sql
psql -X --host=localhost --port=5432 --username=rorymon_app --dbname=rorymon --set=ON_ERROR_STOP=1 --file=002_gen6_gen7_style_saves.sql
psql -X --host=localhost --port=5432 --username=rorymon_app --dbname=rorymon --set=ON_ERROR_STOP=1 --file=verify.sql
psql -X --host=localhost --port=5432 --username=rorymon_app --dbname=rorymon --set=ON_ERROR_STOP=1 --file=verify_v2.sql
```

The migration is transactional, refuses to run outside a database named rorymon, and uses ordinary CREATE/INSERT statements rather than dropping or overwriting tables. Run it once. A second attempt fails without replacing the existing tables. Future changes should use new numbered migrations.

The development login owns the new database so it can apply migrations. For deployment, separate the migration owner from a runtime role with only the privileges the application needs. No Lorewalker permissions are changed.

## Application connection
Copy .env.example into the future backend's local .env and substitute your local connection values. URL-encode special characters in the password. Keep .env out of version control. psql does not automatically read DATABASE_URL from this file. Database credentials must stay server-side.

## Contents and validation
The migration seeds three species, fifteen moves, six natures, two evolutions, twenty-nine learnset entries and six relative asset references. JSONB stores move effects and world state. Base stats and unresolved battle rules remain pending. The JSON content export and working PNG assets are included in the package.

Migration 002 adds an original Generation VI-VII-inspired save model. It provides two rotating save slots, versioned JSONB blocks with SHA-256 checksum fields, recovery ordering, player and position records, story flags and variables, inventory pockets, 32 storage boxes, Pokédex progress, game options, and detailed creature identity/training fields. The application must calculate block and root checksums and should mark a slot active only after all of its blocks have been written and verified.

The conversion and seed references were checked against the validated source data. PostgreSQL is not installed in the preparation environment, so this migration has NOT yet been executed against a PostgreSQL server. Run the commands above to perform that verification locally.

Local PostgreSQL is the development target; Railway is the later deployment target. The previous SQLite file is a superseded portable prototype. No live database has been created by preparing this package.
