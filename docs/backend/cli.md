# CLI

The `/backend/cli.ts` file is a small helper script for running local tasks.  
It was originally used for various migrations (which have since been removed).  
Today, it mainly serves as a general-purpose helper to execute one-off or administrative tasks directly, without the need to create a separate process or endpoint.

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
