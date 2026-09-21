# TypeScript 7 Upgrade

TypeScript 7 remains a separate dependency project. The completed major dependency upgrade history is available in Git rather than maintained as an active handoff document.

## Current baseline

- TypeScript is pinned to `~5.9.3`.
- Node is pinned to `v24.20.0`.
- `@types/node` remains on major 24 to match the runtime.

Do not combine the TypeScript upgrade with an application feature, LNbits upgrade, Cypress-to-Playwright migration batch, or Node major upgrade.

## Compatibility checks

Before changing dependencies, verify the current TypeScript 7 release and explicit support in:

- Vue and `vue-tsc`;
- Vite and Vitest configuration;
- tRPC and the backend TypeScript build;
- `tsc-alias`;
- Cypress, its webpack preprocessor, and `ts-loader`;
- the shared, backend, and frontend `tsconfig` files.

Keep `@types/node` on major 24 unless the project runtime moves from Node 24 in a separate change.

## Verification

After upgrading, run one complete verification pass:

1. Install dependencies and review the package and lockfile diff.
2. Run lint and the project-wide typecheck.
3. Run the unit suites.
4. Build the backend and all frontend output modes.
5. Verify Cypress configuration and TypeScript preprocessing.
6. Run the backend integration, Cypress, and Playwright jobs through the normal pipeline.
7. Review generated declarations, path aliases, and migration tooling for changed compiler behavior.
