# Database Schema
Date: 09.11.2023
Imported from: https://dbdiagram.io/ Issue: #749#note_11517

File: [database.dbml](database.dbml)

### Nameing convention

Due the drizzle way of have a lowercase and uppercase of a database data, the naming convention of two word data objects is as follows:
```typescript
export const cardVersion = mysqlTable('card_versions', {
  id: varchar('id', { length: 256 }).primaryKey().unique(),
  card: varchar('card', { length: 256 }).references(() => card.hash),
  created: datetime('created').notNull(),
})

export type CardVersion = typeof cardVersion.$inferSelect; // return type when queried
```

the naming convention is as follows:
* Drizzle TypeDefinition: uppercase, camelcase `CardVersion`
* Type: uppercase, camelcase `CardVersion`
* Tablename: uppercase, camelcase `CardVersion`
* Filename: uppercase, camelcase `CardVersion`
