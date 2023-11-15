# Script

## Create Schema Files Script
**Why:** Create Drizzle MySql Schemal file from a dbml file

### How To
```bash
# run from project root
npx ts-node scripts/createSchemaFiles/script.ts
```
### DBML json Structure
```typescript
const dbml = fs.readFileSync(DEFINITIONS_FILE, 'utf-8')

const database = Parser.parse(dbml, 'dbml')
const info = database.export()
// console.log(Object.keys(info.schemas[0]))
// [ 'name', 'note', 'alias', 'tables', 'enums', 'tableGroups', 'refs' ]
```

## Run Migration Script

- This script is reading from `/backend/.env`
```
# Info: run from project root

# 1. Create migration files
drizzle-kit generate:mysql --config=backend/drizzle.config.ts

# 2. Run Migration
npx ts-node scripts/run-mirgration/script.ts
```
