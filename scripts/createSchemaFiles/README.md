# Create Schema Files Script
**WHAT:** Create Drizzle MySql Schema files in backend project from a dbml file.

This script:
- is reading drizzle config from  `/backend/drizzle.config.js`
- is reading the dbml file from `/docs/database.bdml`
- and rewrites the directory `/backend/src/database/schema/`

## How To

**Info:** run from project root

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
