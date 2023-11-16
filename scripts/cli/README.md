# CLI

This cli script let's you do two things:

1. **WHAT:** Check all cards with used flag if they are actually used (by calling lnbits).
2. **WHAT:** Migrate to a new lnbits instance. This means deleting unfunded cards from the database and clearing the withdrawId from all unclaimed cards.

## HowTo

**Info:** run from project root

```bash
npx ts-node -P ./scripts/cli/tsconfig.json -r tsconfig-paths/register ./scripts/cli/cli.ts
```
