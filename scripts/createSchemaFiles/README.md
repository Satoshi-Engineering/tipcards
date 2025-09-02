# Create Schema Files Script

**What:** Generates Drizzle MySQL schema files in the backend project from a DBML file.

This script:

- Reads the Drizzle config from `/backend/drizzle.config.js`
- Reads the DBML file from `/docs/database.dbml`
- Rewrites the directory `/backend/src/database/schema/`

## How To

**Info:** Run from the project root:

```bash
npx tsx scripts/createSchemaFiles/script.ts
```

### DevNotes: DBML json Structure

```typescript
const dbml = fs.readFileSync(DEFINITIONS_FILE, 'utf-8')

const database = Parser.parse(dbml, 'dbml')
const info = database.export()
// console.log(Object.keys(info.schemas[0]))
// [ 'name', 'note', 'alias', 'tables', 'enums', 'tableGroups', 'refs' ]
```
