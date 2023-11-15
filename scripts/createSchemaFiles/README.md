# Create Schema Files Script

**Why:** Create Drizzle MySql Schemal file from a dbml file

## How To
```bash
# Call from project root
npm install -D @dbml/core 
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
