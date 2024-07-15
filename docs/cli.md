# CLI

This cli script let's you do multiple things:

1. **WHAT:** Check all cards with used flag if they are actually used (by calling lnbits).
2. **WHAT:** Migrate to a new lnbits instance. This means deleting unfunded cards from the database and clearing the withdrawId from all unclaimed cards.
3. **WHAT:** Parse all cards in redis database with zod.
4. **WHAT:** Parse a single card in redis database with zod and print parsing error.

## HowTo

**Info:** run from project root

```bash
npx tsx --tsconfig ./backend/tsconfig.json ./backend/cli.ts
```

## Run on server

**Info:** run from backend root (e.g. `/var/www/tipcards/backend`)

```bash
node backend/cli.js
```
