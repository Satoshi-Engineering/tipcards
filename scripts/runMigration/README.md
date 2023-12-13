# Run Migration Script

**WHAT:** Update a database after the schema in backend project was changed. This script only handles the migration part.

This script:
- is reading from `/backend/.env`
- is reading drizzle config from  `/backend/drizzle.config.js`
- is writing the migration config to `/dist/drizzle/${process.env.MYSQL_DB_NAME}-migrations`

## HowTo

**Info:** run from project root

1. Create migration files
```bash
npx drizzle-kit generate:mysql --config=backend/drizzle.config.ts
```

2. Run Migration
```bash
npx ts-node scripts/runMigration/script.ts
```

### Info
#### If you need to change migration only for a single table
```bash
npx ts-node scripts/runMigration/script.ts <tablename>
```

#### If you need to drop current created migration files
```bash
drizzle-kit drop --config=backend/drizzle.config.ts
```
