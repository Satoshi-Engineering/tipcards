# Guidelines

- Use the git-hooks!
- `/scripts` folder: Helper script for local development tasks
- Unit tests have to run on every machine after running npm install
- If you write your code according to these guidelines but are unsure about the implementation or if it is an exception to the guidelines, please add a comment to the relevant line in the code.

## Developing a new feature

Ideally the development of a new feature should follow the following procedure:

1. test-driven-development of the new feature
   1. write a unit test that fails with as little code as needed (compilation errors count)
   2. implement code until the unit test succeeds
   3. go back to 1. until the feature is complete
2. make sure the code is clean
3. write an integration test
4. make sure the integration test code is clean
5. add the new feature to docs/testing.md
6. add the new feature to the faqs

## Coding Guidelines

### Naming Conventions

- **Folder:** camelcase, first letter lowercase
- **Files:** camelcase, first letter: if class uppercase otherwise lowercase

#### Exceptions

- `.gitlab-ci.yml`: because this is defined by gitlab CI
  - Because of this, the folder `gitlab-ci` is the same as the yml file
- package-lock.json

### Import Order

1. External libraries
2. libraries from shared project
3. libraries with absolut paths (e.g. `@`, `@frontend`, `@backend`)
4. libraries relative imports

Info:

- Add empty lines between these blocks.
- Add empty lines between `@`, `@frontend`, `@backend` blocks.

### Brackets

- after an if condition, always follow with an opening bracket: <https://eslint.org/docs/latest/rules/curly> use option "all"

### Using environments variables

- Do not import from process.env in application code. Instead always import them from constants.ts.
- Ideally the environment variables should already be validated and type checked in constants.ts

## Database

### Queries

Do not throw errors when a query returns no rows. Instead return null. If you want a NotFoundError in the application, if a specific domain model does not exist in the database, throw the error in the respective domain logic instead.

## Git

### Conventional commits

We are using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).  
In addition, we enforce the following rules:

- A `Refs:` footer is required and must contain a reference to an issue in our gitlab, prefixed with `projects#`.
- You can optionally specify the [scope](https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with-scope). The list of allowed scopes can be found (and extended) in the [commit-msg-config.json](/.githooks/commit-msg-config.json)
