# Database Schema

File: [database.dbml](database.dbml)


## How to update the drizzle schema files

1. Copy the new DBML file from (somewhere) to `/docs/database.dbml`
2. Run "Create Schema Files" Script. Infos: [README.md](../scripts/createSchemaFiles/README.md)


## How to run migrations

**WHAT:** Update a database after the schema in backend project was changed.

### Create new migration files

- is reading from `/backend/.env.local`
- is reading drizzle config from  `/backend/drizzle.config.js`
- is writing the migrations to `/backend/database/drizzle/migrations`

**Info:** run from project root

1. Create migrations according to schema changes: `npx drizzle-kit generate --config=backend/drizzle.config.ts`
2. Create custom migrations (e.g. for data changes): `npx drizzle-kit generate --config=backend/drizzle.config.ts --custom`
3. Write sql update queries into the newly created sql file in `/backend/database/drizzle/migrations`

### Execute the migration files

- is reading from `/backend/.env.local`
- is reading drizzle config from  `/backend/drizzle.config.js`
- is reading the migrations from `/backend/database/drizzle/migrations`

**Info:** for tipcards.io and dev.tipcards.io the migration files are automatically executed in the gitlab pipeline. Just push main or develop branch!

**Info:** for manual execution run from project root

```bash
npx tsx --tsconfig ./backend/tsconfig.json ./backend/drizzle.migrate.ts
```


## Additional info for for development

### If you need to drop migration files

```bash
npx drizzle-kit drop --config=backend/drizzle.config.ts
```
